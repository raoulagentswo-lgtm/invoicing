import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function auditMobileHome() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 12 dimensions
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  });

  const page = await context.newPage();
  
  // Set a longer timeout for network
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(10000);

  const issues = [];
  const recommendations = [];
  const metrics = {};

  try {
    console.log('🔄 Navigating to http://localhost:5175...');
    await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });
    
    // Take screenshot for visual inspection
    console.log('📸 Taking screenshot...');
    const screenshotPath = '/home/freebox/.openclaw/workspace-qa/mobile-home-audit.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✅ Screenshot saved to ${screenshotPath}`);

    // Audit: Check viewport meta tag
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
    console.log(`📱 Viewport meta: ${viewportMeta}`);

    // Audit: Measure layout metrics
    const bodyWidth = await page.evaluate(() => document.body.offsetWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    const maxWidth = await page.evaluate(() => {
      const computed = window.getComputedStyle(document.body);
      return computed.maxWidth;
    });

    metrics.bodyWidth = bodyWidth;
    metrics.windowWidth = windowWidth;
    metrics.maxWidth = maxWidth;

    console.log(`\n📐 Layout Metrics:`);
    console.log(`   Body width: ${bodyWidth}px`);
    console.log(`   Window width: ${windowWidth}px`);
    console.log(`   Max width: ${maxWidth}`);

    // Audit: Check for horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    
    if (hasOverflow) {
      issues.push({
        severity: 'high',
        category: 'Layout',
        title: 'Horizontal Scroll - Page exceeds viewport width',
        description: `Document width (${await page.evaluate(() => document.documentElement.scrollWidth)}px) exceeds viewport (${windowWidth}px)`,
        impact: 'Users will need to scroll horizontally, breaking the mobile experience'
      });
    }

    // Audit: Check heading sizes
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    console.log(`\n📝 Found ${headings.length} headings`);
    
    for (const heading of headings) {
      const text = await heading.textContent();
      const fontSize = await heading.evaluate((el) => window.getComputedStyle(el).fontSize);
      const fontSizePx = parseInt(fontSize);
      
      console.log(`   ${await heading.evaluate(el => el.tagName)}: "${text}" - ${fontSize}`);
      
      if (fontSizePx < 12) {
        issues.push({
          severity: 'high',
          category: 'Typography',
          title: `Heading too small: ${fontSizePx}px`,
          description: `${await heading.evaluate(el => el.tagName)} "${text}" is only ${fontSizePx}px - too small for mobile reading`,
          impact: 'Users may have difficulty reading important content'
        });
      }
    }

    // Audit: Check buttons and clickable elements
    const buttons = await page.locator('button, a[role="button"], input[type="submit"]').all();
    console.log(`\n🔘 Found ${buttons.length} buttons/clickable elements`);
    
    for (const button of buttons) {
      const text = await button.textContent();
      const box = await button.boundingBox();
      const height = box ? box.height : 0;
      const width = box ? box.width : 0;
      
      // Minimum touch target size is 48x48 pixels for mobile
      if (height < 44 || width < 44) {
        issues.push({
          severity: 'medium',
          category: 'Touch Target',
          title: `Small touch target: ${width}x${height}px`,
          description: `Button "${text}" is ${width}x${height}px - below recommended 44x44px minimum`,
          impact: 'Users may accidentally tap wrong buttons or have difficulty clicking'
        });
      }
    }

    // Audit: Check input field sizes
    const inputs = await page.locator('input[type="text"], input[type="email"], input[type="password"], textarea').all();
    console.log(`\n📥 Found ${inputs.length} input fields`);
    
    for (const input of inputs) {
      const box = await input.boundingBox();
      const height = box ? box.height : 0;
      const padding = await input.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        const top = parseInt(styles.paddingTop);
        const bottom = parseInt(styles.paddingBottom);
        return top + bottom;
      });
      
      if (height < 40) {
        issues.push({
          severity: 'medium',
          category: 'Input Fields',
          title: `Input field too small: ${height}px height`,
          description: `Input field height is ${height}px - recommended minimum is 40px for mobile`,
          impact: 'Difficult to tap and use on mobile devices'
        });
      }
      
      console.log(`   Input: ${height}px height, ${padding}px padding`);
    }

    // Audit: Check spacing/padding around elements
    const form = await page.locator('form').first();
    if (form) {
      const formPadding = await form.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          top: styles.paddingTop,
          right: styles.paddingRight,
          bottom: styles.paddingBottom,
          left: styles.paddingLeft
        };
      });
      console.log(`\n🔲 Form padding: ${JSON.stringify(formPadding)}`);
    }

    // Audit: Check for responsive images
    const images = await page.locator('img').all();
    console.log(`\n🖼️ Found ${images.length} images`);
    
    for (const img of images) {
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      const box = await img.boundingBox();
      const naturalWidth = await img.evaluate((el) => el.naturalWidth);
      const naturalHeight = await img.evaluate((el) => el.naturalHeight);
      const displayWidth = box ? box.width : 0;
      
      if (!alt) {
        issues.push({
          severity: 'low',
          category: 'Accessibility',
          title: 'Missing alt text on image',
          description: `Image (${src}) is missing alt attribute`,
          impact: 'Screen readers cannot describe the image'
        });
      }
      
      console.log(`   Image: ${displayWidth}px display, ${naturalWidth}x${naturalHeight}px natural size, alt="${alt}"`);
      
      // Check if image is oversized for mobile
      if (displayWidth > 350 && displayWidth < 380) {
        console.log(`   ⚠️  Image width ${displayWidth}px is close to viewport, might crop on small screens`);
      }
    }

    // Audit: Check for text visibility and contrast
    const textElements = await page.locator('p, label, span').all();
    console.log(`\n✍️ Checking text readability on ${Math.min(5, textElements.length)} text elements...`);
    
    for (let i = 0; i < Math.min(5, textElements.length); i++) {
      const el = textElements[i];
      const fontSize = await el.evaluate((e) => window.getComputedStyle(e).fontSize);
      const fontSizePx = parseInt(fontSize);
      const lineHeight = await el.evaluate((e) => window.getComputedStyle(e).lineHeight);
      const text = (await el.textContent()).substring(0, 50);
      
      if (fontSizePx < 14) {
        issues.push({
          severity: 'medium',
          category: 'Typography',
          title: `Body text too small: ${fontSizePx}px`,
          description: `Text "${text}..." is ${fontSizePx}px - recommended minimum for mobile is 14px`,
          impact: 'May be difficult to read on small screens'
        });
      }
      
      console.log(`   Text: ${fontSizePx}px, line-height: ${lineHeight}`);
    }

    // Audit: Check for form validation states
    const errorMessages = await page.locator('.error, [class*="error"], .invalid, [data-error]').all();
    console.log(`\n⚠️ Form error messages found: ${errorMessages.length}`);

    // Audit: Check touch interaction spaces
    console.log(`\n👆 Touch interaction audit...`);
    const clickableElements = await page.locator('button, a, input, select, textarea').all();
    let tooCloseElements = 0;
    
    for (const el of clickableElements) {
      const box = await el.boundingBox();
      if (box && box.height < 40) {
        tooCloseElements++;
      }
    }
    
    if (tooCloseElements > 0) {
      issues.push({
        severity: 'high',
        category: 'Touch Targets',
        title: `${tooCloseElements} interactive elements below minimum size`,
        description: `${tooCloseElements} out of ${clickableElements.length} clickable elements are smaller than 40px height`,
        impact: 'Increased risk of accidental taps and poor mobile UX'
      });
    }

    // Audit: Check scroll behavior
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const viewportHeight = 844;
    const requiresScroll = scrollHeight > viewportHeight;
    
    console.log(`\n📜 Scroll metrics:`);
    console.log(`   Page height: ${scrollHeight}px`);
    console.log(`   Viewport height: ${viewportHeight}px`);
    console.log(`   Requires scroll: ${requiresScroll}`);
    
    if (requiresScroll) {
      const scrollAmount = scrollHeight - viewportHeight;
      console.log(`   Scroll required: ${scrollAmount}px`);
      if (scrollAmount > 500) {
        recommendations.push({
          priority: 'medium',
          target: 'Lena (UI Designer)',
          title: 'Consider condensing form layout',
          description: `Form requires ${scrollAmount}px of scroll. Consider moving some fields below the fold or using steps/tabs.`,
          action: 'Review form layout for mobile'
        });
      }
    }

    // Audit: Check form field labels
    const labels = await page.locator('label').all();
    console.log(`\n🏷️ Found ${labels.length} form labels`);
    
    for (const label of labels) {
      const fontSize = await label.evaluate((el) => window.getComputedStyle(el).fontSize);
      const fontSizePx = parseInt(fontSize);
      if (fontSizePx < 12) {
        issues.push({
          severity: 'medium',
          category: 'Typography',
          title: `Form label too small: ${fontSizePx}px`,
          description: `Form label font size is ${fontSizePx}px - recommended is 14px minimum`,
          impact: 'Labels may be hard to read'
        });
      }
    }

    // Audit: Check for fixed positioning issues
    const fixedElements = await page.evaluate(() => {
      const elements = [];
      document.querySelectorAll('*').forEach((el) => {
        const position = window.getComputedStyle(el).position;
        if (position === 'fixed' || position === 'sticky') {
          elements.push({
            tag: el.tagName,
            position: position,
            top: window.getComputedStyle(el).top,
            zIndex: window.getComputedStyle(el).zIndex
          });
        }
      });
      return elements;
    });
    
    console.log(`\n📌 Fixed/Sticky elements: ${fixedElements.length}`);
    fixedElements.forEach((el, i) => {
      console.log(`   ${i+1}. ${el.tag} - position: ${el.position}, top: ${el.top}, z-index: ${el.zIndex}`);
    });

    // Audit: CSS media queries
    const mediaQueries = await page.evaluate(() => {
      const styles = [];
      for (let i = 0; i < document.styleSheets.length; i++) {
        try {
          const sheet = document.styleSheets[i];
          const rules = sheet.cssRules || sheet.rules;
          if (rules) {
            for (let j = 0; j < rules.length; j++) {
              if (rules[j].media) {
                styles.push(rules[j].media.mediaText);
              }
            }
          }
        } catch (e) {
          // Cross-origin stylesheet, skip
        }
      }
      return styles;
    });
    
    console.log(`\n📱 Media queries detected: ${mediaQueries.length}`);
    if (mediaQueries.length === 0) {
      recommendations.push({
        priority: 'high',
        target: 'Lena (UI Designer)',
        title: 'No mobile-specific media queries detected',
        description: 'Consider adding @media queries for mobile optimization (max-width: 480px, 768px)',
        action: 'Implement mobile-first responsive design'
      });
    }

  } catch (error) {
    console.error('❌ Error during audit:', error.message);
    issues.push({
      severity: 'critical',
      category: 'General',
      title: 'Page load error',
      description: error.message,
      impact: 'Unable to load page on mobile'
    });
  }

  await context.close();
  await browser.close();

  return { issues, recommendations, metrics };
}

// Run the audit
(async () => {
  const results = await auditMobileHome();
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    device: 'iPhone 12 (390x844)',
    url: 'http://localhost:5175',
    issues: results.issues,
    recommendations: results.recommendations,
    metrics: results.metrics,
    summary: {
      totalIssues: results.issues.length,
      critical: results.issues.filter(i => i.severity === 'critical').length,
      high: results.issues.filter(i => i.severity === 'high').length,
      medium: results.issues.filter(i => i.severity === 'medium').length,
      low: results.issues.filter(i => i.severity === 'low').length,
    }
  };

  // Save JSON report
  const reportPath = '/home/freebox/.openclaw/workspace-qa/mobile-home-audit-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n✅ Report saved to ${reportPath}`);
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('MOBILE HOME PAGE AUDIT - SUMMARY');
  console.log('='.repeat(60));
  console.log(`Device: ${report.device}`);
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`\nIssues Found:`);
  console.log(`  ❌ Critical: ${report.summary.critical}`);
  console.log(`  ❌ High: ${report.summary.high}`);
  console.log(`  ⚠️  Medium: ${report.summary.medium}`);
  console.log(`  ℹ️  Low: ${report.summary.low}`);
  console.log(`\nTotal: ${report.summary.totalIssues} issues\n`);
  
  console.log('Issues by Category:');
  const byCategory = {};
  results.issues.forEach(issue => {
    byCategory[issue.category] = (byCategory[issue.category] || 0) + 1;
  });
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`  • ${cat}: ${count}`);
  });

  process.exit(0);
})();
