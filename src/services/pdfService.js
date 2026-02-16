/**
 * PDF Service
 * 
 * Handles invoice PDF generation with professional styling
 * Story: EPIC-4-001 - Generate PDF
 */

import PDFDocument from 'pdfkit';

/**
 * Generate PDF invoice
 * @param {Object} invoice - Invoice data
 * @param {Object} client - Client data
 * @param {Object} user - User data (with company info)
 * @param {Array} lineItems - Line items array
 * @returns {Promise<Buffer>} PDF buffer
 */
export async function generateInvoicePDF(invoice, client, user, lineItems = []) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Helper functions
      const addHeader = () => {
        // Company name and logo placeholder
        doc.fontSize(20)
          .font('Helvetica-Bold')
          .text(user.companyName || 'My Company', 50, 50);

        // Invoice title
        doc.fontSize(16)
          .font('Helvetica-Bold')
          .text('INVOICE', 400, 50);

        // Invoice number and dates
        const invoiceY = 80;
        doc.fontSize(10)
          .font('Helvetica')
          .text(`Invoice #: ${invoice.invoiceNumber || 'INV-' + invoice.id.substring(0, 8)}`, 400, invoiceY)
          .text(`Invoice Date: ${formatDate(invoice.invoiceDate)}`, 400, invoiceY + 15)
          .text(`Due Date: ${formatDate(invoice.dueDate)}`, 400, invoiceY + 30);

        // Add horizontal line
        doc.moveTo(50, 130)
          .lineTo(550, 130)
          .stroke();
      };

      const addClientInfo = () => {
        const clientY = 150;
        doc.fontSize(10)
          .font('Helvetica-Bold')
          .text('Bill To:', 50, clientY);

        doc.fontSize(10)
          .font('Helvetica')
          .text(client.name, 50, clientY + 20)
          .text(client.address || '', 50, clientY + 35)
          .text(`${client.city || ''} ${client.zipCode || ''}`.trim(), 50, clientY + 50)
          .text(client.country || '', 50, clientY + 65)
          .text(`Email: ${client.email}`, 50, clientY + 80);

        if (client.phone) {
          doc.text(`Phone: ${client.phone}`, 50, clientY + 95);
        }
      };

      const addLineItems = () => {
        let itemsY = 280;

        // Table header
        const headers = ['Description', 'Qty', 'Unit Price', 'Amount'];
        const columnPositions = [50, 350, 420, 500];

        doc.fontSize(10)
          .font('Helvetica-Bold');

        headers.forEach((header, i) => {
          doc.text(header, columnPositions[i], itemsY);
        });

        // Line under header
        doc.moveTo(50, itemsY + 15)
          .lineTo(550, itemsY + 15)
          .stroke();

        itemsY += 30;

        // Line items
        doc.font('Helvetica')
          .fontSize(10);

        lineItems.forEach((item) => {
          const description = item.description || '';
          const quantity = item.quantity || 0;
          const unitPrice = parseFloat(item.unitPrice || 0);
          const amount = quantity * unitPrice;

          doc.text(description, columnPositions[0], itemsY, { width: 280 })
            .text(quantity.toString(), columnPositions[1], itemsY)
            .text(`€${unitPrice.toFixed(2)}`, columnPositions[2], itemsY)
            .text(`€${amount.toFixed(2)}`, columnPositions[3], itemsY);

          itemsY += 30;
        });

        return itemsY;
      };

      const addTotals = (startY) => {
        let totalsY = startY + 20;

        const subtotal = lineItems.reduce((sum, item) => {
          return sum + ((item.quantity || 0) * (parseFloat(item.unitPrice) || 0));
        }, 0);

        const taxRate = (invoice.taxRate || 0) / 100;
        const taxAmount = subtotal * taxRate;
        const total = subtotal + taxAmount;

        doc.fontSize(10)
          .font('Helvetica');

        // Line before totals
        doc.moveTo(350, totalsY)
          .lineTo(550, totalsY)
          .stroke();

        totalsY += 15;

        // Subtotal
        doc.text('Subtotal:', 350, totalsY)
          .text(`€${subtotal.toFixed(2)}`, 480, totalsY);

        totalsY += 20;

        // Tax
        doc.text(`Tax (${invoice.taxRate}%):`, 350, totalsY)
          .text(`€${taxAmount.toFixed(2)}`, 480, totalsY);

        totalsY += 20;

        // Total (bold)
        doc.font('Helvetica-Bold')
          .fontSize(12)
          .text('TOTAL:', 350, totalsY)
          .text(`€${total.toFixed(2)}`, 480, totalsY);

        return totalsY;
      };

      const addFooter = () => {
        const footerY = 750;

        // Line above footer
        doc.moveTo(50, footerY)
          .lineTo(550, footerY)
          .stroke();

        doc.fontSize(9)
          .font('Helvetica');

        const footerText = [];

        if (user.bankName) {
          footerText.push(`Bank: ${user.bankName}`);
        }
        if (user.iban) {
          footerText.push(`IBAN: ${user.iban}`);
        }
        if (invoice.paymentTerms) {
          footerText.push(`Payment Terms: ${invoice.paymentTerms}`);
        }
        if (invoice.paymentInstructions) {
          footerText.push(`Payment Instructions: ${invoice.paymentInstructions}`);
        }

        let footerItemY = footerY + 15;
        footerText.forEach((text) => {
          doc.text(text, 50, footerItemY);
          footerItemY += 15;
        });

        // Page footer
        doc.fontSize(8)
          .text(
            `Page 1 | Generated on ${new Date().toLocaleDateString()}`,
            50,
            780,
            { align: 'center' }
          );
      };

      // Build PDF
      addHeader();
      addClientInfo();
      const itemsEndY = addLineItems();
      addTotals(itemsEndY);
      addFooter();

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Format date for display
 * @param {Date|string} date
 * @returns {string}
 */
function formatDate(date) {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default {
  generateInvoicePDF
};
