# Spécification UX Complète - Application de Facturation pour PME

**Version:** 1.0  
**Date:** 16 février 2026  
**Statut:** Phase Planning - UX Design  
**Auteur:** Équipe UX Design  
**Source PRD:** 02_prd.md

---

## 📋 Table des Matières

1. [Design System](#1-design-system)
2. [Architecture Information & Navigation](#2-architecture-information--navigation)
3. [User Flows Détaillés](#3-user-flows-détaillés)
4. [Wireframes Textuels - Écrans Principaux](#4-wireframes-textuels---écrans-principaux)
5. [Interactions & Animations](#5-interactions--animations)
6. [Accessibilité WCAG 2.1 AA](#6-accessibilité-wcag-21-aa)
7. [Responsive Design](#7-responsive-design)
8. [Patterns UX États Critiques](#8-patterns-ux-états-critiques)
9. [Micro-interactions & Feedback](#9-micro-interactions--feedback)
10. [Performance & Perception](#10-performance--perception)

---

# 1. Design System

## 1.1 Palette de Couleurs

### Couleurs Primaires (Marque)

```
PRIMARY_BLUE    #2563EB    Confiance, professionnalisme
  - Light       #3B82F6    États hover/active
  - Dark        #1E40AF    États focus/emphasis

ACCENT_GREEN    #10B981    Succès, confirmation
  - Light       #34D399    Backgrounds positifs
  - Dark        #059669    États hover succès

DANGER_RED      #EF4444    Erreurs, alertes
  - Light       #FCA5A5    Backgrounds erreurs
  - Dark        #991B1B    États hover danger

WARNING_AMBER   #F59E0B    Avertissements, infos
  - Light       #FBBF24    Backgrounds warning
  - Dark        #B45309    États hover warning
```

### Couleurs Neutrales (Grayscale)

```
NEUTRAL_50      #F9FAFB    Backgrounds très clairs
NEUTRAL_100     #F3F4F6    Backgrounds secondaires
NEUTRAL_200     #E5E7EB    Borders, dividers
NEUTRAL_300     #D1D5DB    Disabled states
NEUTRAL_400     #9CA3AF    Secondary text
NEUTRAL_500     #6B7280    Tertiary text, placeholders
NEUTRAL_600     #4B5563    Primary text (body)
NEUTRAL_700     #374151    Headings
NEUTRAL_800     #1F2937    Dark text
NEUTRAL_900     #111827    Almost black (accessibility)
```

### Couleurs Sémantiques

```
SUCCESS         #10B981    Paiement confirmé, création ok
INFO            #0EA5E9    Information, notifications
ERROR           #EF4444    Erreur, validation failed
WARNING         #F59E0B    Attention requise (facture retard)
DISABLED        #D1D5DB    États désactivés

INVOICE_DRAFT   #6B7280    État brouillon
INVOICE_ISSUED  #2563EB    État émise
INVOICE_PAID    #10B981    État payée
INVOICE_OVERDUE #EF4444    État en retard
INVOICE_CANCELLED #9CA3AF   État annulée
```

### Gradients

```
PRIMARY_GRADIENT     linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)
SUCCESS_GRADIENT     linear-gradient(135deg, #10B981 0%, #34D399 100%)
WARNING_GRADIENT     linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)
```

## 1.2 Typographie

### Familles de Polices

```
FONT_STACK_SANS:
  - system: -apple-system, BlinkMacSystemFont, 'Segoe UI'
  - webfont: 'Inter' (Google Fonts)
  - fallback: sans-serif
  
  Raison: Inter offre excellente lisibilité, neutre, minimaliste
  Licence: Open Source (SIL)

FONT_STACK_MONO:
  - 'JetBrains Mono' ou 'Fira Code'
  - fallback: monospace
  
  Raison: Code clarity (numéros facture, SIRET)
```

### Échelle Typographique (REM-based)

```
H1  font-size: 2.5rem (40px)  font-weight: 700  line-height: 1.2
    Titres pages principales, grandes annonces

H2  font-size: 2rem (32px)     font-weight: 700  line-height: 1.3
    Titres sections majeurs

H3  font-size: 1.5rem (24px)   font-weight: 600  line-height: 1.4
    Sous-titres sections

H4  font-size: 1.25rem (20px)  font-weight: 600  line-height: 1.4
    Labels sections

H5  font-size: 1rem (16px)     font-weight: 600  line-height: 1.5
    Sous-labels, card titles

H6  font-size: 0.875rem (14px) font-weight: 600  line-height: 1.5
    Small headings, badge labels

BODY_LG  font-size: 1.125rem (18px) font-weight: 400  line-height: 1.6
         Texte long (descriptions)

BODY_MD  font-size: 1rem (16px)     font-weight: 400  line-height: 1.6
         Texte standard (corps, paragraphes)

BODY_SM  font-size: 0.875rem (14px) font-weight: 400  line-height: 1.5
         Texte secondaire, helper text

BODY_XS  font-size: 0.75rem (12px)  font-weight: 400  line-height: 1.4
         Très petit texte (footers, metadata)

MONO_MD  font-size: 0.875rem (14px) font-weight: 400  line-height: 1.5
         Numéros facture, codes, SIRET (monospace)
```

### Font Weights

```
LIGHT       300  (rare)
REGULAR     400  (text par défaut)
MEDIUM      500  (subtle emphasis)
SEMI_BOLD   600  (labels, subtitles)
BOLD        700  (headings, emphasis)
EXTRA_BOLD  800  (rare emphasis)
```

## 1.3 Spacing System (8px Grid)

### Ratios Espacements

```
0px   -> 0rem     (no space)
4px   -> 0.25rem  (xs)
8px   -> 0.5rem   (sm)
12px  -> 0.75rem  (md)
16px  -> 1rem     (lg)
20px  -> 1.25rem  (xl)
24px  -> 1.5rem   (2xl)
32px  -> 2rem     (3xl)
40px  -> 2.5rem   (4xl)
48px  -> 3rem     (5xl)
56px  -> 3.5rem   (6xl)
64px  -> 4rem     (7xl)
80px  -> 5rem     (8xl)
96px  -> 6rem     (9xl)
```

### Spacing Appliquée (Composants)

```
PADDING_COMPACT       8px vertical, 12px horizontal   (buttons, badges)
PADDING_NORMAL        12px vertical, 16px horizontal  (form inputs)
PADDING_SPACIOUS      16px vertical, 20px horizontal  (cards, panels)
PADDING_SECTION       24px vertical, 32px horizontal  (sections principales)
PADDING_PAGE          40px (mobile: 20px)             (page margins)

MARGIN_BETWEEN_INPUTS 16px  (spacing entre champs)
MARGIN_BETWEEN_SECTIONS 32px (spacing entre blocs)
MARGIN_BETWEEN_CARDS  20px  (card gap, list spacing)

GAP_COMPACT       8px   (tight spacing: toolbar, inline items)
GAP_NORMAL        12px  (standard spacing: form fields)
GAP_SPACIOUS      16px  (loose spacing: cards)
GAP_SECTIONS      32px  (major sections)
```

## 1.4 Composants Réutilisables Clés

### Boutons

#### Button Primary (CTA)
```
Styles:
  - Background: #2563EB (PRIMARY_BLUE)
  - Color: White
  - Padding: 12px 20px
  - Border-radius: 8px
  - Font-size: 1rem (16px)
  - Font-weight: 600
  - Border: none

States:
  - Default: #2563EB, cursor: pointer
  - Hover: #1E40AF (background darker), box-shadow: 0 4px 12px rgba(37,99,235,0.3)
  - Active: #1E40AF, transform: scale(0.98)
  - Focus: outline: 2px solid #3B82F6, outline-offset: 2px
  - Disabled: opacity: 0.5, cursor: not-allowed

Size Variants:
  - xs: padding 8px 12px, font-size 0.75rem
  - sm: padding 10px 16px, font-size 0.875rem
  - md: padding 12px 20px, font-size 1rem (default)
  - lg: padding 14px 24px, font-size 1.125rem
  - xl: padding 16px 28px, font-size 1.25rem
```

#### Button Secondary (Alternative)
```
Styles:
  - Background: #F3F4F6 (NEUTRAL_100)
  - Color: #374151 (NEUTRAL_700)
  - Border: 1px solid #E5E7EB (NEUTRAL_200)
  - Padding: 12px 20px
  - Border-radius: 8px

States:
  - Default: gray background
  - Hover: background #E5E7EB, border #D1D5DB
  - Active: background #D1D5DB
  - Focus: outline: 2px solid #2563EB, outline-offset: 2px
  - Disabled: opacity: 0.5, cursor: not-allowed
```

#### Button Danger/Destructive
```
Styles:
  - Background: #EF4444 (DANGER_RED)
  - Color: White
  - Padding: 12px 20px
  - Border-radius: 8px
  - Font-weight: 600

States:
  - Default: #EF4444
  - Hover: #991B1B (darker)
  - Active: #991B1B
  - Focus: outline: 2px solid #FCA5A5
  - Disabled: opacity: 0.5

Usage: Delete, Cancel facture, Logout
```

#### Button Ghost/Subtle
```
Styles:
  - Background: transparent
  - Color: #2563EB (PRIMARY_BLUE)
  - Border: none
  - Padding: 10px 16px
  - Text-decoration: underline (optional)

States:
  - Default: transparent
  - Hover: background #E0E7FF, color #1E40AF
  - Active: background #C7D2FE
  - Focus: outline: 2px solid #2563EB
```

### Input Fields

#### Text Input
```
Styles:
  - Width: 100% (container-dependent)
  - Padding: 12px 16px (vertical 12px, horizontal 16px)
  - Font-size: 1rem (16px)
  - Border: 1px solid #D1D5DB (NEUTRAL_300)
  - Border-radius: 8px
  - Background: #FFFFFF (white)
  - Color: #1F2937 (NEUTRAL_800)
  - Line-height: 1.5

States:
  - Default: border #D1D5DB
  - Focus: border: 2px solid #2563EB, box-shadow: 0 0 0 3px rgba(37,99,235,0.1)
  - Hover (empty): border #9CA3AF
  - Filled: border #D1D5DB
  - Error: border: 2px solid #EF4444, background: #FEF2F2
  - Disabled: background #F3F4F6, color #9CA3AF, cursor: not-allowed
  - Readonly: background #F9FAFB, cursor: not-allowed

Placeholder:
  - Color: #9CA3AF (NEUTRAL_400)
  - Font-weight: 400
  - Opacity: 1.0
```

#### Select/Dropdown
```
Styles:
  - Similar to text input
  - Padding: 12px 16px
  - Appearance: none (custom arrow)
  - Arrow-icon: positioned right 12px, color #6B7280

States:
  - Default: border #D1D5DB
  - Open: border #2563EB
  - Focus: border: 2px solid #2563EB
  - Hover: border #9CA3AF
  - Error: border #EF4444, background #FEF2F2
  - Disabled: background #F3F4F6, color #9CA3AF

Dropdown Menu:
  - Background: #FFFFFF
  - Border: 1px solid #E5E7EB
  - Box-shadow: 0 4px 12px rgba(0,0,0,0.1)
  - Border-radius: 8px
  - Max-height: 300px, overflow-y: auto
  - Option padding: 12px 16px
  - Option hover: background #F0F9FF
  - Option selected: background #DBEAFE, color #0284C7 (accent)
```

#### Checkbox & Radio
```
Checkbox:
  - Size: 20px × 20px
  - Border: 2px solid #D1D5DB
  - Border-radius: 6px
  - Checked: background #2563EB, border #2563EB
  - Checkmark: white, icon-style
  - Focus: box-shadow: 0 0 0 3px rgba(37,99,235,0.1)
  - Disabled: background #F3F4F6, border #D1D5DB, opacity 0.5

Radio:
  - Size: 20px × 20px
  - Border: 2px solid #D1D5DB
  - Border-radius: 50% (circle)
  - Checked: border #2563EB, dot-center #2563EB (8px diameter)
  - Focus: box-shadow: 0 0 0 3px rgba(37,99,235,0.1)
  - Disabled: opacity 0.5
```

### Cards & Containers

#### Standard Card
```
Styles:
  - Background: #FFFFFF
  - Border: 1px solid #E5E7EB (NEUTRAL_200)
  - Border-radius: 12px
  - Padding: 20px (spacious internal padding)
  - Box-shadow: 0 1px 3px rgba(0,0,0,0.1) (subtle)

Variants:
  - Elevated: box-shadow 0 4px 12px rgba(0,0,0,0.08)
  - Bordered: box-shadow none, border 1px solid #E5E7EB
  - Flat: no border, no shadow, background #F9FAFB

Hover state:
  - Elevated variant: box-shadow 0 8px 20px rgba(0,0,0,0.12)
  - Other: no change unless interactive
```

#### Alert/Banner
```
Success:
  - Background: #ECFDF5 (#34D399 at 10%)
  - Border-left: 4px solid #10B981
  - Color: #065F46
  - Icon: checkmark green
  - Padding: 12px 16px

Error:
  - Background: #FEF2F2 (#EF4444 at 10%)
  - Border-left: 4px solid #EF4444
  - Color: #7F1D1D
  - Icon: x-circle red
  - Padding: 12px 16px

Warning:
  - Background: #FFFBEB (#F59E0B at 10%)
  - Border-left: 4px solid #F59E0B
  - Color: #78350F
  - Icon: alert-triangle amber
  - Padding: 12px 16px

Info:
  - Background: #EFF6FF (#0EA5E9 at 10%)
  - Border-left: 4px solid #0EA5E9
  - Color: #0C4A6E
  - Icon: info-circle blue
  - Padding: 12px 16px
```

#### Modal/Dialog
```
Overlay:
  - Background: rgba(0,0,0,0.5)
  - Animation: fade-in 200ms ease-out

Dialog:
  - Background: #FFFFFF
  - Border-radius: 12px
  - Box-shadow: 0 20px 60px rgba(0,0,0,0.3)
  - Max-width: 500px (desktop)
  - Width: 90vw (mobile)
  - Padding: 24px (dialog content)
  - Animation: slide-up 300ms ease-out

Components:
  - Header (title): H2, 24px, margin-bottom 16px
  - Body: padding 0 (already set in dialog)
  - Footer (actions): padding-top 20px, border-top #E5E7EB, gap 12px, flex row

Close button:
  - Top-right corner
  - Icon: X (24px)
  - Background: transparent
  - Hover: background #F3F4F6
```

### Form Layout

#### Form Group
```
Structure:
  - Label (optional)
  - Input/Control
  - Helper text (optional)
  - Error message (optional)
  - Gap: 8px between label and input

Label:
  - Font-size: 0.875rem (14px)
  - Font-weight: 600
  - Color: #374151 (NEUTRAL_700)
  - Margin-bottom: 8px
  - Required indicator: red asterisk (*) after text

Helper Text:
  - Font-size: 0.75rem (12px)
  - Color: #6B7280 (NEUTRAL_500)
  - Margin-top: 4px

Error Message:
  - Font-size: 0.75rem (12px)
  - Color: #EF4444 (DANGER_RED)
  - Margin-top: 4px
  - Icon: ⚠️ before text
```

#### Form Column Layout
```
Single Column (mobile, < 768px):
  - Full width fields
  - Gap: 16px between rows

Two Column (tablet+, >= 768px):
  - Grid 2 columns
  - Gap: 16px (horizontal & vertical)
  - Column width: calc(50% - 8px)

Three Column (desktop, >= 1200px):
  - Grid 3 columns
  - Gap: 16px
  - Column width: calc(33.333% - 11px)
```

### Tables/Lists

#### Data Table
```
Header Row:
  - Background: #F3F4F6 (NEUTRAL_100)
  - Border-bottom: 1px solid #E5E7EB
  - Font-weight: 600
  - Padding: 12px 16px
  - Color: #374151 (NEUTRAL_700)

Data Rows:
  - Background: #FFFFFF
  - Border-bottom: 1px solid #E5E7EB
  - Padding: 12px 16px
  - Height: 48px (minimum)
  - Color: #1F2937 (NEUTRAL_800)

Row Hover:
  - Background: #F9FAFB (NEUTRAL_50)
  - Cursor: pointer (if clickable)

Row Stripe (optional):
  - Alternate rows: background #F9FAFB (every 2nd row)
  - Improves readability grandes tables

Responsive:
  - < 768px: horizontal scroll, sticky left column

Sorting:
  - Sortable column header: cursor pointer
  - Sort icon: ▲▼ indicator next to text
  - Active sort: color #2563EB
```

### Pagination

```
Structure:
  - Previous button (chevron-left)
  - Page numbers (1, 2, 3... or abbreviated)
  - Next button (chevron-right)
  - Current page info (optional): "Page 1 of 10"

Styles:
  - Buttons: similar to button secondary
  - Current page: background #2563EB, color white
  - Disabled pages: opacity 0.5, cursor not-allowed
  - Gap between buttons: 8px

Mobile:
  - Hide page numbers
  - Show "Prev" & "Next" buttons only
  - Display page counter: "1/10"
```

### Badges & Tags

#### Badge
```
Styles:
  - Font-size: 0.75rem (12px)
  - Font-weight: 600
  - Padding: 4px 8px
  - Border-radius: 20px (fully rounded)
  - Display: inline-block

Variants by Status (Invoice):
  - DRAFT: background #E5E7EB, color #374151
  - ISSUED: background #DBEAFE, color #0C4A6E
  - PAID: background #D1FAE5, color #065F46
  - OVERDUE: background #FEE2E2, color #7F1D1D
  - CANCELLED: background #F3F4F6, color #6B7280
```

#### Pill/Tag
```
Styles:
  - Font-size: 0.875rem (14px)
  - Padding: 6px 12px
  - Border-radius: 20px
  - Display: inline-flex
  - Gap: 6px (icon + text)
  - Border: 1px solid #E5E7EB

Close action:
  - X icon right side
  - Cursor: pointer
  - Hover: background lighten
```

### Navigation

#### Top Navigation Bar
```
Styles:
  - Height: 64px
  - Background: #FFFFFF
  - Border-bottom: 1px solid #E5E7EB
  - Padding: 0 20px (mobile), 0 40px (desktop)
  - Box-shadow: 0 1px 3px rgba(0,0,0,0.1)
  - Display: flex
  - Align-items: center
  - Justify-content: space-between

Components:
  - Logo (left): height 32px
  - Menu/breadcrumb (center): flex grow
  - User menu (right): avatar + dropdown

Sticky: yes, z-index: 100
```

#### Sidebar Navigation
```
Styles:
  - Width: 280px (desktop)
  - Background: #FFFFFF
  - Border-right: 1px solid #E5E7EB
  - Height: 100vh
  - Position: sticky (top: 64px)
  - Padding: 20px 0

Items:
  - Padding: 12px 16px
  - Font-size: 0.875rem (14px)
  - Color: #6B7280
  - Icon: 20px, left-margin 0, text-margin 12px

States:
  - Default: color #6B7280, background transparent
  - Hover: background #F3F4F6
  - Active/Current: background #EFF6FF, color #2563EB, font-weight 600

Mobile:
  - Hidden by default
  - Toggle via hamburger menu
  - Overlay: z-index 200, background rgba(0,0,0,0.3)
  - Slide-in from left
```

#### Breadcrumbs
```
Styles:
  - Font-size: 0.875rem (14px)
  - Color: #6B7280
  - Separator: "/" or ">" with same color
  - Current item: color #1F2937, font-weight 600

States:
  - Inactive links: color #2563EB, cursor pointer
  - Hover: color #1E40AF, text-decoration underline
  - Current: gray, no link
```

## 1.5 Icons

### Icon System

```
Icon Library: Lucide React (open source, 300+ icons)
  - All icons: 24px default size
  - Stroke-width: 2
  - Color: inherit from text
  - Custom size variants: 16px, 20px, 24px (default), 32px

Common Icons (Facturation app):
  - plus           : create/add actions
  - pencil         : edit actions
  - trash-2        : delete actions
  - eye            : view/visibility
  - eye-off        : hide
  - download       : download/export
  - upload         : import/upload
  - mail           : email actions
  - send           : send actions
  - check          : success/done
  - x              : cancel/close
  - chevron-down   : dropdowns
  - chevron-right  : navigation
  - arrow-left     : back navigation
  - search         : search/filter
  - filter         : filter actions
  - calendar       : date inputs
  - clock          : time inputs
  - user           : user profile
  - settings       : settings
  - menu           : menu toggle
  - home           : dashboard
  - file-text      : documents/invoices
  - dollar-sign    : currency/money
  - trending-up    : analytics/growth
  - alert-circle  : warning/error
  - info          : information
  - bell          : notifications
```

## 1.6 Élevation & Shadows

### Z-Index Scale

```
LEVEL_BASE         0      Base layer
LEVEL_DROPDOWN     10     Dropdown menus
LEVEL_STICKY       20     Sticky headers
LEVEL_MODAL        100    Modal overlay
LEVEL_MODAL_CONTENT 101   Modal dialog content
LEVEL_TOOLTIP      110    Tooltips (above modals)
LEVEL_POPOVER      50     Popovers (above content, below modals)
```

### Shadow Scale

```
SHADOW_SM      0 1px 2px 0 rgba(0, 0, 0, 0.05)
SHADOW_MD      0 4px 6px -1px rgba(0, 0, 0, 0.1)
SHADOW_LG      0 10px 15px -3px rgba(0, 0, 0, 0.1)
SHADOW_XL      0 20px 25px -5px rgba(0, 0, 0, 0.1)
SHADOW_2XL     0 25px 50px -12px rgba(0, 0, 0, 0.25)

SHADOW_HOVER   0 4px 12px rgba(0, 0, 0, 0.15)
```

---

# 2. Architecture Information & Navigation

## 2.1 Information Architecture (IA)

### Structure Hiérarchique Globale

```
APPLICATION ROOT
│
├─ PUBLIC ROUTES
│  ├─ /landing          [Page d'accueil (future)]
│  ├─ /auth/signup      [Inscription]
│  ├─ /auth/login       [Connexion]
│  ├─ /auth/reset       [Récupération mot de passe]
│  └─ /auth/verify      [Vérification email (optional)]
│
├─ AUTHENTICATED ROUTES (requireAuth)
│  │
│  ├─ /dashboard
│  │  ├─ / (overview)       [Dashboard principal - KPIs]
│  │  ├─ /outstanding       [Factures impayées]
│  │  └─ /overdue           [Factures en retard]
│  │
│  ├─ /invoices
│  │  ├─ / (list)           [Liste factures + filtres/tri]
│  │  ├─ /create            [Création nouvelle facture]
│  │  ├─ /:id (detail)      [Vue détail + actions]
│  │  ├─ /:id/edit          [Édition (brouillon seulement)]
│  │  ├─ /:id/pdf           [Génération/Prévisualisation PDF]
│  │  └─ /:id/history       [Audit trail facture]
│  │
│  ├─ /clients
│  │  ├─ / (list)           [Liste clients + recherche]
│  │  ├─ /create            [Créer client]
│  │  ├─ /:id (detail)      [Profil client + factures liées]
│  │  ├─ /:id/edit          [Éditer client]
│  │  └─ /import            [Importer CSV]
│  │
│  ├─ /settings
│  │  ├─ /profile           [Profil utilisateur]
│  │  ├─ /company           [Infos légales (SIRET, etc)]
│  │  ├─ /billing           [Devise, conditions paiement défaut]
│  │  ├─ /invoicing         [Format numérotation, CGV]
│  │  ├─ /notifications     [Préférences alertes email]
│  │  ├─ /security          [2FA, password, sessions]
│  │  └─ /data              [Export/Delete (RGPD)]
│  │
│  ├─ /help
│  │  ├─ /faq               [FAQ/Documentation]
│  │  ├─ /contact           [Support]
│  │  └─ /onboarding        [Réafficher tour]
│  │
│  └─ /account
│     └─ /logout            [Déconnexion]
```

### Depth Levels

```
LEVEL 0 (Navigation)  : /dashboard, /invoices, /clients, /settings
LEVEL 1 (Primary)     : /invoices/list, /invoices/create, /clients/list
LEVEL 2 (Details)     : /invoices/:id, /clients/:id/edit
LEVEL 3 (Sub-details) : /invoices/:id/pdf, /invoices/:id/history
```

## 2.2 Navigation Principale

### Navigation Desktop (Sidebar + Top Bar)

```
┌──────────────────────────────────────────────────────────┐
│ [Logo] [Breadcrumb: Dashboard / ...] [Search] [User Menu] │
├─────────────┬──────────────────────────────────────────────┤
│             │                                              │
│  Dashboard  │                                              │
│  • Overview │         MAIN CONTENT AREA                   │
│  • Income   │         (Dynamic based on route)            │
│  • Overdue  │                                              │
│             │                                              │
│  Invoices   │                                              │
│  • All      │                                              │
│  • Create   │                                              │
│             │                                              │
│  Clients    │                                              │
│  • All      │                                              │
│  • Create   │                                              │
│  • Import   │                                              │
│             │                                              │
│  Settings   │                                              │
│  • Profile  │                                              │
│  • Company  │                                              │
│  • Billing  │                                              │
│             │                                              │
│  Help       │                                              │
│  • FAQ      │                                              │
│  • Support  │                                              │
│             │                                              │
│  [Logout]   │                                              │
└─────────────┴──────────────────────────────────────────────┘

Sidebar width: 280px (fixed, sticky)
Sidebar collapse: available on < 1024px
```

### Navigation Mobile (Hamburger Menu)

```
┌─────────────────────────────────────┐
│ [≡ Menu] [App Name] [Avatar] [⋮]   │
├─────────────────────────────────────┤
│ MAIN CONTENT (full width)           │
│                                     │
│                                     │
└─────────────────────────────────────┘

Mobile menu (overlay):
┌──────────────────────┐
│ [X Close]            │
├──────────────────────┤
│ Dashboard            │
│ Invoices             │
│ Clients              │
│ Settings             │
│ Help                 │
├──────────────────────┤
│ [Account Info]       │
│ [Logout]             │
└──────────────────────┘

Menu slides in from left
Overlay behind: rgba(0,0,0,0.3)
```

---

# 3. User Flows Détaillés

## 3.1 User Flow - Onboarding & Authentification

### Flow: Sign Up → First Invoice

```
START
  │
  ├─ User discovers app
  │
  └─ Click "Get Started" / "Sign Up"
      │
      ▼
  ┌─────────────────────────────────────────┐
  │ SIGN UP PAGE                            │
  │ Fields:                                 │
  │ • Email (required)                      │
  │ • First Name (required)                 │
  │ • Last Name (required)                  │
  │ • Password (required, 8+ chars)         │
  │ • Confirm Password                      │
  │ □ Accept ToS                            │
  │                                         │
  │ [Create Account] [Sign In instead]      │
  └─────────────────────────────────────────┘
      │
      ├─ Validation fails
      │  ├─ Email invalid → show error
      │  ├─ Password weak → show requirements
      │  └─ Other → show field-level error
      │
      ▼
  ✓ Account created
  │
  ├─ Send verification email
  │
  ▼
  ┌─────────────────────────────────────────┐
  │ EMAIL VERIFICATION (Optional v1)        │
  │ "Check your email for verification      │
  │ link. Valid for 24 hours."              │
  │                                         │
  │ [Resend Email] [Skip]                   │
  └─────────────────────────────────────────┘
      │
      ▼
  ┌─────────────────────────────────────────┐
  │ ONBOARDING TOUR (4-5 steps, skippable)  │
  │                                         │
  │ Step 1: Welcome                         │
  │ "Let's set up your account in           │
  │ 2 minutes"                              │
  │ [Next] [Skip Tour]                      │
  └─────────────────────────────────────────┘
      │
      ▼
  ┌─────────────────────────────────────────┐
  │ ONBOARDING - Step 2: Company Profile    │
  │                                         │
  │ Company Name *                          │
  │ [ _________________ ]                   │
  │                                         │
  │ SIRET/SIREN (optional)                  │
  │ [ _________________ ]                   │
  │                                         │
  │ Address (optional)                      │
  │ [ _________________ ]                   │
  │                                         │
  │ [Back] [Next] [Skip]                    │
  └─────────────────────────────────────────┘
      │
      ▼
  ┌─────────────────────────────────────────┐
  │ ONBOARDING - Step 3: Add First Client   │
  │                                         │
  │ Client Name *                           │
  │ [ _________________ ]                   │
  │                                         │
  │ Email *                                 │
  │ [ _________________ ]                   │
  │                                         │
  │ Address (optional)                      │
  │ [ _________________ ]                   │
  │                                         │
  │ [Add Client] [Skip]                     │
  └─────────────────────────────────────────┘
      │
      ▼
  ┌─────────────────────────────────────────┐
  │ ONBOARDING - Step 4: Create Invoice     │
  │                                         │
  │ Select Client *                         │
  │ [Dropdown ▼]                            │
  │                                         │
  │ Service Description *                   │
  │ [ _________________ ]                   │
  │                                         │
  │ Amount *                                │
  │ [ _________________ ]                   │
  │                                         │
  │ [Create Invoice]                        │
  └─────────────────────────────────────────┘
      │
      ▼
  ┌─────────────────────────────────────────┐
  │ ONBOARDING - Step 5: Success!           │
  │                                         │
  │ ✅ Your first invoice is ready!         │
  │                                         │
  │ [Next Steps] [View Dashboard] [Done]    │
  └─────────────────────────────────────────┘
      │
      ▼
  ┌─────────────────────────────────────────┐
  │ DASHBOARD (First time)                  │
  │ - Summary card: 1 invoice created       │
  │ - Quick actions: "Create invoice",      │
  │   "Add client", "Export PDF"            │
  │ - Can restart tour anytime              │
  └─────────────────────────────────────────┘
```

## 3.2 User Flow - Créer Facture Complète

### Flow: Create → Edit → Emit → Send → Track

```
USER IN DASHBOARD
│
└─ Click "Create Invoice" / "New Invoice"
    │
    ▼
┌──────────────────────────────────────┐
│ CREATE INVOICE - FORM PAGE           │
│ (Auto-drafted, recoverable 30 days)  │
│                                      │
│ CLIENT SELECTION                     │
│ ──────────────────                  │
│ Select Client *                      │
│ [ Dropdown with search ▼ ]           │
│ ├─ [+ Add New Client]                │
│ └─ Recent clients (Claire Design...) │
│                                      │
│ INVOICE DETAILS                      │
│ ─────────────────                   │
│ Invoice Number                       │
│ [FAC-2026-001] (read-only, auto)    │
│                                      │
│ Issue Date *                         │
│ [📅 Today]                           │
│                                      │
│ Due Date *                           │
│ [📅 Today + 30 days] (auto calc)     │
│                                      │
│ Payment Terms                        │
│ ◉ Net 30  ○ Net 60  ○ Immediate     │
│ ○ Custom (input days)                │
│                                      │
│ LINE ITEMS                           │
│ ───────────────                      │
│ Description | Qty | Price | Tax | Total
│ [___________|____|_______|____|______]
│ [___________|____|_______|____|______]
│ [___________|____|_______|____|______]
│ [+ Add Line]                         │
│                                      │
│ SUMMARY                              │
│ ──────────                           │
│ Subtotal HT:           €0.00        │
│ Tax (20%):             €0.00        │
│ Discount (optional):   €0.00        │
│ ──────────────────────────           │
│ TOTAL TTC:             €0.00        │
│                                      │
│ NOTES & CONDITIONS                   │
│ ──────────────────────              │
│ Internal Notes (optional)            │
│ [ Rich text editor ________________ │
│   _________________________________]│
│                                      │
│ Terms & Conditions (optional)        │
│ [ Prefilled from settings _________ │
│   _________________________________]│
│                                      │
│ [← Back] [Save & Preview] [Save]    │
└──────────────────────────────────────┘
     │
     ├─ Click "Save"
     │  ├─ Auto-save every 10s (in background)
     │  ├─ Show toast: "Invoice saved"
     │  └─ Redirect stays on form (if editing)
     │
     └─ Click "Save & Preview"
         │
         ▼
    ┌──────────────────────────────────┐
    │ PDF PREVIEW MODAL                │
    │                                  │
    │ [PDF rendered in iframe]         │
    │                                  │
    │ Invoice details visible:         │
    │ - Header: Company logo           │
    │ - Client info                    │
    │ - Line items table               │
    │ - Totals                         │
    │ - Terms & Conditions             │
    │ - Footer: Company details        │
    │                                  │
    │ [← Edit] [Download] [Send Email] │
    │ [Emit Invoice]                   │
    └──────────────────────────────────┘
         │
         ├─ Click "← Edit" → back to form
         │
         ├─ Click "Download" → PDF downloaded
         │
         ├─ Click "Send Email"
         │  │
         │  ▼
         │  ┌─────────────────────────────┐
         │  │ SEND EMAIL MODAL            │
         │  │                             │
         │  │ To: [client@email.com ✓]    │
         │  │                             │
         │  │ Subject: [Auto-filled]      │
         │  │ "Invoice FAC-2026-001"      │
         │  │                             │
         │  │ Message (optional)          │
         │  │ [Default template...]       │
         │  │                             │
         │  │ [Cancel] [Send Email]       │
         │  └─────────────────────────────┘
         │      │
         │      └─ Email sent
         │         Show: "Email sent to client@email.com"
         │         Log: timestamp, recipient in invoice
         │
         └─ Click "Emit Invoice"
             │
             ▼
          ┌──────────────────────────────────┐
          │ EMIT CONFIRMATION MODAL          │
          │                                  │
          │ ⚠️ You're about to emit this    │
          │ invoice.                        │
          │                                  │
          │ Once emitted, you won't be able │
          │ to edit it. You'll need to      │
          │ cancel and create a new one.    │
          │                                  │
          │ Continue?                       │
          │                                  │
          │ [Cancel] [Emit Invoice]         │
          └──────────────────────────────────┘
              │
              └─ Status: DRAFT → ISSUED
                 Timestamp: now
                 Redirect: Invoice detail page
                 Show toast: "Invoice emitted successfully"
                 Show dashboard update
```

## 3.3 User Flow - Track & Collect Payment

### Flow: Monitor Outstanding → Mark Paid → Dashboard Update

```
USER IN DASHBOARD
│
└─ View "Outstanding Invoices" widget
    │
    ┌──────────────────────────────────────┐
    │ OUTSTANDING INVOICES CARD            │
    │ ──────────────────────────────────   │
    │ Total Pending: €5,200.50              │
    │                                      │
    │ Invoices (sorted by due date):       │
    │                                      │
    │ [FAC-2026-001] | Client A | €1000    │
    │ Due: Today | [Mark Paid ✓]           │
    │                                      │
    │ [FAC-2026-002] | Client B | €2200.50 │
    │ Due: Mar 20 | [Mark Paid ✓]          │
    │                                      │
    │ [FAC-2026-003] | Client C | €2000    │
    │ Due: Mar 30 [OVERDUE 5 days] ⚠️      │
    │          | [Mark Paid ✓]             │
    │          | [Send Reminder]           │
    │                                      │
    │ [View All]                           │
    └──────────────────────────────────────┘
        │
        └─ Click "Mark Paid ✓" on FAC-2026-001
            │
            ▼
        ┌──────────────────────────────────┐
        │ MARK AS PAID MODAL               │
        │                                  │
        │ Invoice: FAC-2026-001            │
        │ Amount: €1,000.00                │
        │                                  │
        │ Date Paid *                      │
        │ [📅 Today]                       │
        │                                  │
        │ Amount Paid *                    │
        │ [€1,000.00] (pre-filled)         │
        │ (Allow partial payment: €______) │
        │                                  │
        │ Payment Method                   │
        │ ○ Not specified                  │
        │ ○ Bank Transfer                  │
        │ ○ Card                           │
        │ ○ Check                          │
        │ ○ Other                          │
        │                                  │
        │ Notes (optional)                 │
        │ [_____________________________]  │
        │                                  │
        │ [Cancel] [Mark as Paid]          │
        └──────────────────────────────────┘
            │
            └─ Status: ISSUED → PAID
               Redirect: dashboard or detail page
               
               DASHBOARD UPDATES:
               - "Total Outstanding": -€1,000
               - "Total Paid": +€1,000
               - Widget refresh: FAC-2026-001 disappears
               - Metrics recalculate (DSO, collection rate)
```

---

# 4. Wireframes Textuels - Écrans Principaux

## 4.1 Dashboard Principal (Overview)

```
┌────────────────────────────────────────────────────────────────────┐
│ DASHBOARD                                                          │
├────────────────────────────────────────────────────────────────────┤
│ Welcome back, Claire!                                              │
│ Thursday, February 16, 2026                                        │
│                                                                    │
│ ┌──────────────────────────────────────────────────────────────┐  │
│ │ KPI ROW 1 (4 cards)                                          │  │
│ ├────────────────┬────────────────┬────────────────┬──────────┤  │
│ │ Total Invoiced │ Total Paid     │ Outstanding    │ Overdue  │  │
│ │ €12,500.00     │ €8,200.00      │ €4,300.00      │ €2,100   │  │
│ │ ↑ +15% vs last │ ↑ +8% vs last  │ ↓ -5% vs last  │ ⚠️ Urgent│  │
│ │ month          │ month          │ month          │          │  │
│ └────────────────┴────────────────┴────────────────┴──────────┘  │
│                                                                    │
│ ┌──────────────────────────────────────────────────────────────┐  │
│ │ KPI ROW 2 (metrics)                                          │  │
│ ├────────────────┬────────────────┬────────────────┐              │
│ │ Collection %   │ Days to Pay    │ Invoices this  │              │
│ │ 76%            │ 18 days        │ month: 5       │              │
│ │ Target: 85%    │ (Target: <30)  │                │              │
│ └────────────────┴────────────────┴────────────────┘              │
│                                                                    │
│ ┌──────────────────────────────────────────────────────────────┐  │
│ │ CHART SECTION - This Month Revenue Trend                    │  │
│ │                                                              │  │
│ │    €                                                        │  │
│ │    4k ┤          ╱╲      ╱╲                                 │  │
│ │    3k ┤     ╱╲  ╱  ╲    ╱  ╲                                │  │
│ │    2k ┤    ╱  ╲╱    ╲  ╱    ╲     ← Current month on track │  │
│ │    1k ┤___╱         ╲╱       ╲___ (€2,500 this month)      │  │
│ │    0 ┼─────────────────────────────                         │  │
│ │      1  5  10 15 20 25 30                                  │  │
│ │                                                              │  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ ┌──────────────────────────┬──────────────────────────────────┐  │
│ │ OUTSTANDING INVOICES     │ UPCOMING OVERDUE                │  │
│ │ (Next 30 days)           │ (Next 15 days)                  │  │
│ ├──────────────────────────┼──────────────────────────────────┤  │
│ │ FAC-2026-001             │ FAC-2026-003                     │  │
│ │ Client A: €1,000         │ Client C: €2,000                │  │
│ │ Due Today [Mark Paid ✓]  │ Overdue by 5 days ⚠️            │  │
│ │                          │ [Send Reminder] [Mark Paid ✓]   │  │
│ │ FAC-2026-002             │                                  │  │
│ │ Client B: €2,200.50      │ FAC-2026-004                     │  │
│ │ Due Mar 20               │ Client D: €1,500                │  │
│ │ [Mark Paid ✓]            │ Overdue by 2 days ⚠️            │  │
│ │                          │ [Send Reminder] [Mark Paid ✓]   │  │
│ │                          │                                  │  │
│ │ [View All Outstanding]   │                                  │  │
│ └──────────────────────────┴──────────────────────────────────┘  │
│                                                                    │
│ ┌──────────────────────────────────────────────────────────────┐  │
│ │ QUICK ACTIONS                                                │  │
│ ├──────────────┬──────────────┬──────────────┬────────────────┤  │
│ │ [+ New       │ [+ New       │ [📁 Export   │ [📊 View       │  │
│ │  Invoice]    │  Client]     │  Report]     │  Analytics]    │  │
│ └──────────────┴──────────────┴──────────────┴────────────────┘  │
└────────────────────────────────────────────────────────────────────┘

Responsive:
- Desktop (≥1200px): 4-column KPI row, 2-column cards below, charts full width
- Tablet (768-1199px): 2-column KPI rows, 1-column cards, charts full width
- Mobile (<768px): 1-column KPI cards, stacked sections, chart hidden or simplified
```

## 4.2 Liste Factures (Invoices List)

```
┌────────────────────────────────────────────────────────────────────┐
│ INVOICES                                                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ [+ Create Invoice]                                                │
│                                                                    │
│ FILTERS & SEARCH                                                  │
│ ────────────────────────────────────────────────────────────────  │
│ [🔍 Search by client, number...      ] [⚙️ Filters ▼]             │
│                                                                    │
│ Filter options (expandable):                                      │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ Status: ☑ All ☑ Draft ☑ Issued ☑ Paid ☐ Cancelled       │   │
│ │ Date: [📅 From] [📅 To] [This Month] [All Time]          │   │
│ │ Client: [Select Client ▼] or (any)                       │   │
│ │ Amount: [Min €_] [Max €_]                                 │   │
│ │ Sort: [Latest first ▼] [By amount] [By client]           │   │
│ │                                                            │   │
│ │ [Reset Filters] [Apply]                                   │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│ INVOICES TABLE                                                    │
│ ────────────────────────────────────────────────────────────────  │
│                                                                    │
│ # | Status | Client       | Amount    | Due Date   | Action       │
│───┼────────┼──────────────┼───────────┼────────────┼──────────────│
│   │        │              │           │            │              │
│ ☐ │ ISSUED │ Client A     │ €1,000.00 │ 16 Feb     │ ⋮ [Menu ▼]   │
│   │ ○      │              │           │            │ Edit / View /│
│   │        │              │           │            │ Duplicate   │
│───┼────────┼──────────────┼───────────┼────────────┼──────────────│
│   │        │              │           │            │              │
│ ☐ │ DRAFT  │ Client B     │ €2,200.50 │ 20 Mar     │ ⋮ [Menu ▼]   │
│   │ ⭕    │              │           │            │ Edit / View /│
│   │        │              │           │            │ Delete      │
│───┼────────┼──────────────┼───────────┼────────────┼──────────────│
│   │        │              │           │            │              │
│ ☐ │ PAID   │ Client C     │ €2,000.00 │ 30 Mar     │ ⋮ [Menu ▼]   │
│   │ ✓      │              │           │ (Paid:Jan) │ View / Dup   │
│   │        │              │           │            │              │
│───┼────────┼──────────────┼───────────┼────────────┼──────────────│
│   │        │              │           │            │              │
│ ☐ │OVERDUE │ Client D     │ €1,500.00 │ 12 Feb ⚠️  │ ⋮ [Menu ▼]   │
│   │⚠️ RED │              │           │ (5 days)   │ Mark Paid /  │
│   │        │              │           │            │ Send Reminder│
│───┼────────┼──────────────┼───────────┼────────────┼──────────────│
│   │        │              │           │            │              │
│ ☐ │ ISSUED │ Client E     │ €500.00   │ 25 Mar     │ ⋮ [Menu ▼]   │
│   │ ○      │              │           │            │              │
│   │        │              │           │            │              │
│───┴────────┴──────────────┴───────────┴────────────┴──────────────│
│                                                                    │
│ PAGINATION                                                        │
│ [← Prev] [1] [2] [3] [4] [Next →]                                │
│ Showing 5-20 of 127 invoices                                     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Color coding:
- Status badges: DRAFT (gray), ISSUED (blue), PAID (green), OVERDUE (red)
- Overdue rows: light red background (#FEF2F2)

Mobile behavior:
- Table collapses to card view:
  ┌────────────────────┐
  │ FAC-2026-001       │
  │ Client A           │
  │ €1,000 | ISSUED    │
  │ Due: 16 Feb        │
  │ [More ⋮]           │
  └────────────────────┘
```

## 4.3 Créer/Éditer Facture (Form Détaillé)

```
┌────────────────────────────────────────────────────────────────────┐
│ ◀ INVOICES > CREATE INVOICE                  [Save] [Preview]     │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ SECTION 1: CLIENT & DATES                                         │
│ ─────────────────────────────────────────────────────────────────  │
│                                                                    │
│ Select Client * ┌────────────────────────────────────────────┐    │
│                 │ 🔍 Search clients (name, email)...       │    │
│                 ├────────────────────────────────────────────┤    │
│                 │ ✓ Claire Design (claire@design.fr)       │    │
│                 │ ~ Marc Consulting (marc@consulting.fr)   │    │
│                 │ ~ [+ Add New Client]                     │    │
│                 └────────────────────────────────────────────┘    │
│                                                                    │
│ Invoice Number (Auto-generated)                                   │
│ [FAC-2026-001]                                                     │
│ (Cannot be edited until saved)                                    │
│                                                                    │
│ ┌─────────────────────┬─────────────────────────────────────────┐ │
│ │ Issue Date *        │ Due Date *                              │ │
│ │ [📅 16 Feb 2026]    │ [📅 18 Mar 2026] (auto: +30 days)      │ │
│ │                     │                                         │ │
│ │ Payment Terms:      │                                         │ │
│ │ ○ Net 30 (default)  │ (Can adjust due date manually)          │ │
│ │ ○ Net 60            │ Or change payment terms:                │ │
│ │ ○ Immediate         │ [Net 60 ▼]                              │ │
│ │ ○ Custom: [__ days] │                                         │ │
│ └─────────────────────┴─────────────────────────────────────────┘ │
│                                                                    │
│ SECTION 2: LINE ITEMS                                             │
│ ─────────────────────────────────────────────────────────────────  │
│                                                                    │
│ Description *        Qty *   Unit Price * Tax    Line Total      │
│ ───────────────────────────────────────────────────────────────── │
│ [Graphic Design...] │ 1   │ €1,500.00   │ 20% │ €1,800.00      │
│ (Click to edit, show X remove)                                    │
│                                                                    │
│ [Web Development] │ 10h  │ €150.00 /h │ 20% │ €1,800.00      │
│ (Click to edit, show X remove)                                    │
│                                                                    │
│ [Empty line for new item]                                         │
│ [ ________________] │ __  │ [_________] │ ▼ │ €0.00          │
│                                                                    │
│ [+ Add Line Item]                                                 │
│                                                                    │
│ SUMMARY PANEL (Right side, sticky on desktop)                    │
│ ┌─────────────────────────────────────────────────────────────┐  │
│ │ Subtotal HT (excl. tax):  €3,300.00                        │  │
│ │ Tax (20%):                 €660.00                          │  │
│ │ ──────────────────────────────────                           │  │
│ │ TOTAL TTC (incl. tax):     €3,960.00                        │  │
│ │                                                             │  │
│ │ Discount (optional):       €0.00                           │  │
│ │ [Apply % ▼] [Apply €]                                      │  │
│ │ ──────────────────────────────────                           │  │
│ │ AMOUNT DUE:                €3,960.00                        │  │
│ └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ SECTION 3: NOTES & CONDITIONS                                    │
│ ─────────────────────────────────────────────────────────────────  │
│                                                                    │
│ Internal Notes (private, not on PDF)                              │
│ ┌──────────────────────────────────────────────────────────────┐  │
│ │ Project code: PRJ-001                                        │  │
│ │ Follow-up with client after invoice                         │  │
│ │                                                              │  │
│ │                                                              │  │
│ │ (Character count: 87/500)                                    │  │
│ │ [Format: B I U Link]                                         │  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ Terms & Conditions (public, appears on PDF)                       │
│ ┌──────────────────────────────────────────────────────────────┐  │
│ │ Thank you for your business! Payment terms are as above.    │  │
│ │ Please remit payment by the due date. Late payments will    │  │
│ │ be subject to a 1.5% monthly interest charge.               │  │
│ │                                                              │  │
│ │ For questions, please contact...                            │  │
│ │                                                              │  │
│ │ [Reset to Default]                                          │  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ ACTIONS (Bottom sticky bar on mobile)                             │
│ ┌──────────────────────────────────────────────────────────────┐  │
│ │ [Cancel] [Save Draft] [Save & Preview] [Preview]            │  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ Auto-save indicator: "Last saved 30 seconds ago" (gray text)     │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

Mobile layout:
- Sticky summary at bottom (collapsible)
- Form sections stacked full-width
- Font size: slightly larger for usability
```

## 4.4 Détail Facture + Actions

```
┌────────────────────────────────────────────────────────────────────┐
│ ◀ INVOICES > FAC-2026-001                [More ⋮] [Close ✕]       │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ STATUS BADGE & KEY INFO                                           │
│ ┌──────────────────────────────────────────────────────────────┐  │
│ │ ○ ISSUED                                                    │  │
│ │ Issued: 16 Feb 2026                                        │  │
│ │ Due: 18 Mar 2026 (30 days from now)                        │  │
│ │ Client: Claire Design (claire@design.fr)                   │  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ INVOICE PREVIEW (PDF-like rendering)                              │
│ ┌──────────────────────────────────────────────────────────────┐  │
│ │ [Company Logo] FAC-2026-001                                 │  │
│ │                                                              │  │
│ │ Your Company Name                                           │  │
│ │ SIRET: 123 456 789 00012                                    │  │
│ │ Address, City, Country                                      │  │
│ │                                                              │  │
│ │ INVOICE TO:                                                 │  │
│ │ Claire Design                                               │  │
│ │ claire@design.fr                                            │  │
│ │ Design Studio Address                                       │  │
│ │                                                              │  │
│ │ Invoice Date: 16 Feb 2026                                   │  │
│ │ Due Date: 18 Mar 2026                                       │  │
│ │ Payment Terms: Net 30                                       │  │
│ │                                                              │  │
│ │ DESCRIPTION         QTY    UNIT PRICE    TAX    AMOUNT      │  │
│ │ ────────────────────────────────────────────────────────    │  │
│ │ Graphic Design      1      €1,500.00     20%    €1,800.00   │  │
│ │ Web Development     10     €150.00/hr    20%    €1,800.00   │  │
│ │                                                              │  │
│ │                        SUBTOTAL:              €3,300.00    │  │
│ │                        TAX (20%):             €660.00      │  │
│ │                        ──────────────────────────────      │  │
│ │                        TOTAL DUE:             €3,960.00    │  │
│ │                                                              │  │
│ │ Terms & Conditions:                                         │  │
│ │ Thank you for your business! Payment due by 18 Mar 2026    │  │
│ │                                                              │  │
│ │ Company: Your Company Name | www.yourcompany.com            │  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ ACTIONS PANEL (Right sidebar on desktop, bottom on mobile)        │
│ ┌──────────────────────────────────────────────────────────────┐  │
│ │ INVOICE STATUS                                              │  │
│ │ ○ ISSUED (Cannot edit)                                      │  │
│ │                                                              │  │
│ │ QUICK ACTIONS                                               │  │
│ │ [📄 Edit]           (grayed out for ISSUED)                 │  │
│ │ [📥 Download PDF]   (generates new version)                 │  │
│ │ [✉️ Send Email]     (opens email modal)                     │  │
│ │ [✓ Mark as Paid]    (opens payment modal)                   │  │
│ │ [⚙️ More Options]                                            │  │
│ │   └─ Duplicate      (copy → new draft)                      │  │
│ │   └─ View History   (audit trail)                           │  │
│ │   └─ Cancel Invoice (soft-delete, mark CANCELLED)           │  │
│ │                                                              │  │
│ │ RELATED INFORMATION                                         │  │
│ │ Created: 16 Feb 2026 by You                                │  │
│ │ Last Updated: 16 Feb 2026                                  │  │
│ │                                                              │  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ TIMELINE / ACTIVITY (collapsible section)                         │
│ ┌──────────────────────────────────────────────────────────────┐  │
│ │ INVOICE ACTIVITY                                             │  │
│ │ ───────────────────────────────────────────────────────────  │  │
│ │ 16 Feb 2026 14:30 - Invoice Created by You                 │  │
│ │ 16 Feb 2026 14:45 - Email sent to Claire Design            │  │
│ │                                                              │  │
│ └──────────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## 4.5 Clients List & Details

```
┌────────────────────────────────────────────────────────────────────┐
│ CLIENTS                                                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ [+ Add Client] [📤 Import CSV] [📥 Export CSV]                    │
│                                                                    │
│ SEARCH & FILTERS                                                  │
│ [🔍 Search by name, email, SIRET...] [⚙️ Filters]                 │
│                                                                    │
│ CLIENTS TABLE                                                     │
│ ─────────────────────────────────────────────────────────────────  │
│                                                                    │
│ ☐ Name              Email              Phone           Action    │
│───┼──────────────────┼──────────────────┼──────────────┼──────────│
│   │                  │                  │              │          │
│ ☐ │ Claire Design ★  │ claire@design.fr│ +33612345678 │ ⋮        │
│   │                  │                  │              │ Edit /   │
│   │                  │                  │              │ View /   │
│   │                  │                  │              │ Archive  │
│───┼──────────────────┼──────────────────┼──────────────┼──────────│
│   │                  │                  │              │          │
│ ☐ │ Marc Consulting  │ marc@cons...fr  │              │ ⋮        │
│   │                  │                  │              │ Edit /   │
│   │                  │                  │              │ View /   │
│───┼──────────────────┼──────────────────┼──────────────┼──────────│
│   │                  │                  │              │          │
│ ☐ │ Web Agency 123   │ hello@agency.fr │ +33987654321 │ ⋮        │
│   │                  │                  │              │          │
│───┴──────────────────┴──────────────────┴──────────────┴──────────│
│                                                                    │
│ Pagination: [← Prev] [1] [2] [Next →]                             │
│ Showing 1-20 of 47 clients                                       │
│                                                                    │
│ ★ = Favorite (quick filter available)                             │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

CLIENT DETAIL PANEL (Sidebar when clicked)
┌──────────────────────────────────────────┐
│ ◀ Claire Design                          │
├──────────────────────────────────────────┤
│ EMAIL: claire@design.fr                  │
│ PHONE: +33612345678                      │
│ ADDRESS: 123 Design St, Paris, 75001     │
│ SIRET: 123 456 789 00012                 │
│                                          │
│ ★ Add to Favorites                       │
│                                          │
│ RECENT INVOICES (Last 5)                 │
│ FAC-2026-001 €1,800 ISSUED 16 Feb       │
│ FAC-2026-002 €2,200 PAID    10 Feb      │
│ FAC-2026-003 €1,500 DRAFT   01 Feb      │
│                                          │
│ [View All Invoices] [+ New Invoice]      │
│                                          │
│ ACTIONS                                  │
│ [✏️ Edit] [📞 Contact] [🗑️ Archive]     │
│                                          │
└──────────────────────────────────────────┘
```

## 4.6 Settings Pages (Profile & Company)

```
┌────────────────────────────────────────────────────────────────────┐
│ SETTINGS                                                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ SETTINGS TABS:                                                    │
│ [Profile] [Company] [Billing] [Invoicing] [Notifications]...      │
│                                                                    │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ PROFILE TAB                                                    │ │
│ ├────────────────────────────────────────────────────────────────┤ │
│ │                                                                │ │
│ │ PERSONAL INFORMATION                                          │ │
│ │ ──────────────────────────────────────────────────────────── │ │
│ │                                                                │ │
│ │ ┌─────────────┐  First Name *          Last Name *           │ │
│ │ │ [Avatar]    │  [______________________] [__________]       │ │
│ │ │ [Upload]    │                                              │ │
│ │ └─────────────┘  Email (username) *                          │ │
│ │                  [__________________________]                 │ │
│ │                  (Cannot be changed unless via admin)         │ │
│ │                                                                │ │
│ │                  Phone Number (optional)                      │ │
│ │                  [__________________________]                 │ │
│ │                                                                │ │
│ │                  Address (optional)                           │ │
│ │                  [____________________]                       │ │
│ │                                                                │ │
│ │                  City / Postal Code / Country                 │ │
│ │                  [_____] [__________] [_________]             │ │
│ │                                                                │ │
│ │ PREFERENCES                                                    │ │
│ │ ──────────────────────────────────────────────────────────── │ │
│ │                                                                │ │
│ │ Language:  [🇬🇧 English ▼]                                    │ │
│ │ Timezone:  [Europe/Paris ▼]                                  │ │
│ │                                                                │ │
│ │ [Save Changes]                                                │ │
│ │                                                                │ │
│ └────────────────────────────────────────────────────────────────┘ │
│                                                                    │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ COMPANY TAB                                                    │ │
│ ├────────────────────────────────────────────────────────────────┤ │
│ │                                                                │ │
│ │ COMPANY INFORMATION                                           │ │
│ │ ──────────────────────────────────────────────────────────── │ │
│ │                                                                │ │
│ │ Company Name *                                                │ │
│ │ [__________________________________]                         │ │
│ │                                                                │ │
│ │ SIRET *                                                       │ │
│ │ [__________________________________]                         │ │
│ │ Format: 14 digits (validated)                                 │ │
│ │                                                                │ │
│ │ SIREN (optional)                                              │ │
│ │ [__________________________________]                         │ │
│ │                                                                │ │
│ │ Tax Regime *                                                  │ │
│ │ [Micro-entrepreneur ▼]                                        │ │
│ │                                                                │ │
│ │ Code APE (optional)                                           │ │
│ │ [__________________________________]                         │ │
│ │                                                                │ │
│ │ Address *                                                     │ │
│ │ [__________________________________]                         │ │
│ │                                                                │ │
│ │ City / Postal Code / Country                                  │ │
│ │ [_____] [__________] [_________]                              │ │
│ │                                                                │ │
│ │ LOGO & BRANDING                                               │ │
│ │ ──────────────────────────────────────────────────────────── │ │
│ │                                                                │ │
│ │ ┌─────────────────┐                                          │ │
│ │ │ [Logo Preview]  │  [📤 Upload Logo] (max 2MB)              │ │
│ │ │ (200x100px)     │  Current: logo.png                       │ │
│ │ │                 │  [🗑️ Remove]                            │ │
│ │ └─────────────────┘                                          │ │
│ │                                                                │ │
│ │ Signature (optional)                                          │ │
│ │ ┌─────────────────┐                                          │ │
│ │ │ [Sig Preview]   │  [📤 Upload Signature] (max 2MB)         │ │
│ │ │                 │  [🗑️ Remove]                            │ │
│ │ └─────────────────┘                                          │ │
│ │                                                                │ │
│ │ [Save Changes]                                                │ │
│ │                                                                │ │
│ └────────────────────────────────────────────────────────────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

# 5. Interactions & Animations

## 5.1 Transitions & Animations Standards

### Page Transitions

```
Standard fade-in (on route change):
- Duration: 150ms
- Easing: ease-out
- Opacity: 0 → 1

Example CSS:
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.page-enter {
  animation: fadeIn 150ms ease-out;
}
```

### Component Enter Animations

```
Modal/Dialog entrance:
- Overlay: fade-in 200ms ease-out
- Dialog: scale(0.95) + opacity 0 → scale(1) + opacity 1
- Duration: 300ms
- Easing: cubic-bezier(0.16, 1, 0.3, 1) (spring-like)

Dropdown menu entrance:
- Origin: top center
- Scale: 0.95 → 1.0
- Opacity: 0 → 1
- Duration: 150ms
- Easing: ease-out

Toast notifications:
- Slide in from top: translateY(-20px) → translateY(0)
- Opacity: 0 → 1
- Duration: 200ms
- Exit: reverse, 150ms
```

### Micro-interactions

```
Button hover state:
- Background color: change immediately (no delay)
- Scale: 1.0 (no hover scale, maintains layout stability)
- Box-shadow: 0 1px 3px → 0 4px 12px (200ms ease-out)
- Cursor: pointer
- Feedback immediate

Button active/pressed:
- Scale: 0.98 (subtle press effect)
- Duration: 100ms
- Easing: ease-in-out

Input focus:
- Border color: change immediately
- Box-shadow: add 200ms ease-out
- No scale change
- Placeholder text: fade out slightly

Form submission:
- Button: loading spinner appears (100ms)
- Button text: fade out (100ms)
- Button disabled: immediate

Loading skeleton:
- Shimmer effect: pulse 1.5s infinite ease-in-out
- Opacity: 0.6 → 1.0 → 0.6
```

## 5.2 Interactive Behaviors

### Invoice Creation Flow

```
User interaction: Click "Add Line"
├─ Button feedback: hover shadow appears (200ms)
├─ Click response: immediate visual feedback (active state)
└─ Result: new empty line appears
   ├─ Animation: fade-in + slide-up from bottom (200ms)
   ├─ Focus: auto-focus first field (description) after 100ms
   └─ Keyboard: can use Tab to navigate line items

User interaction: Type in quantity field
├─ Input validation: real-time (no delay)
├─ Error display: appear below field with slide-down (150ms)
└─ Summary update: recalculate total (instant, no animation)

User interaction: Click "Save"
├─ Button: shows loading spinner (100ms)
├─ Button text: fades out
├─ Form: disabled (can't submit twice)
├─ Success: button → checkmark (200ms)
├─ Toast: "Invoice saved" slides in from top (200ms)
└─ Auto-hide toast: after 4 seconds (fade out 150ms)
```

### List Interactions

```
User interaction: Filter application
├─ Transition: loading skeleton appears (100ms)
├─ Duration: actual filtering < 200ms
├─ Exit animation: fade out old results (100ms)
├─ Entry animation: fade in new results (150ms)
└─ Scroll: auto-scroll to top if results > 3 screens

User interaction: Sorting
├─ Column header: shows loading indicator
├─ Table body: fade out (100ms)
├─ Resort: < 100ms
├─ Fade in: (150ms)
└─ Sort arrow icon: rotate 180° (200ms) if reversed

User interaction: Pagination click
├─ Button: visual feedback (active state)
├─ Table: fade out (100ms)
├─ Load new page: < 200ms
├─ Fade in: (150ms)
└─ Scroll: auto-scroll to table top
```

### Modal Interactions

```
User interaction: Click "Delete Invoice"
├─ Confirmation modal appears:
│  ├─ Overlay: fade-in (200ms)
│  ├─ Dialog: scale-in from center (300ms)
│  └─ Danger button: red, grayed initially
├─ User types "DELETE" (confirmation flow):
│  ├─ Input validation: real-time
│  ├─ Button enable: immediate when input matches
│  └─ Button color: gray → red (transition 200ms)
└─ Cancel or Submit:
   ├─ Dialog: scale-out (150ms)
   ├─ Overlay: fade-out (150ms)
   └─ Redirect: post-delete

User interaction: Click outside modal (backdrop)
├─ No action (modal sticky)
├─ Escape key: closes modal (same animation as cancel)
└─ Focus trap: focus cycles within modal
```

---

# 6. Accessibilité WCAG 2.1 AA

## 6.1 Contraste et Couleurs

### Ratios de Contraste Minimum (WCAG AA)

```
Normal text: 4.5:1 (ratio)
Large text (≥18px or ≥14px bold): 3:1

Application:
- Body text (#1F2937 on #FFFFFF): 12.5:1 ✓
- Secondary text (#6B7280 on #FFFFFF): 7.2:1 ✓
- Link color (#2563EB on #FFFFFF): 4.8:1 ✓
- Placeholder (#9CA3AF on #FFFFFF): 4.1:1 ✓
- Disabled state (#D1D5DB on #FFFFFF): 2.2:1 ✗ (but OK as disabled)

Status colors:
- Green success (#10B981 on white): 2.8:1 ✗
  → Use with icon + text label (green + checkmark icon)
  
- Red error (#EF4444 on white): 3.5:1 ✗
  → Use with icon + text label (red + X icon)
  
- Blue info (#0EA5E9 on white): 2.1:1 ✗
  → Use with icon + text label (blue + info icon)
  
- Amber warning (#F59E0B on white): 1.8:1 ✗
  → Use dark text + warning icon

SOLUTION: Never rely on color alone for information conveying.
Always pair color with:
1. Icons (checkmark, X, exclamation, info)
2. Text labels ("Success", "Error", "Warning")
3. Visual patterns (badge shape, borders)

Status badges examples (improved contrast):
- ISSUED: blue border + text (no light background alone)
- PAID: green border + checkmark icon + text
- OVERDUE: red border + alert icon + text
```

### Color Blindness Considerations

```
Palette optimized for common color blindness:
1. Deuteranopia (red-green) - most common
   ├─ Avoid: red/green combination alone
   ├─ Use: blue + orange instead
   └─ Icons: essential for distinction

2. Protanopia (red-green, shifted)
   ├─ Avoid: red alone
   ├─ Use: colors + icons + text

3. Tritanopia (blue-yellow)
   ├─ Rare but consider
   ├─ Use: red/blue + pink instead

Invoice status colors (color-blind safe):
- DRAFT: gray (neutral, always distinct)
- ISSUED: blue (safe for most color blindness)
- PAID: green + checkmark (green softer, icon critical)
- OVERDUE: red + exclamation (icon critical)
- CANCELLED: gray-ish

Testing:
- Use Colorblind Simulator (https://www.color-blindness.com/coblis-color-blindness-simulator/)
- Test all critical UI with Deuteranopia filter
```

## 6.2 Structure HTML & Sémantique

### Heading Hierarchy

```
Page structure:
<h1>Dashboard</h1>
  <h2>KPI Summary</h2>
    (KPI cards)
  <h2>Outstanding Invoices</h2>
    (Invoice list)
  <h2>Charts</h2>
    <h3>Revenue Trend This Month</h3>
    <h3>Collection Rate</h3>

Form structure:
<h1>Create Invoice</h1>
<form>
  <fieldset>
    <legend>Client & Dates</legend>
    <div class="form-group">
      <label htmlFor="clientSelect">Select Client *</label>
      <select id="clientSelect" aria-required="true">
        ...
      </select>
      <span className="helper-text">Start typing to search</span>
    </div>
    ...
  </fieldset>
  <fieldset>
    <legend>Line Items</legend>
    ...
  </fieldset>
</form>

Table:
<table>
  <caption>List of invoices (sorted by due date)</caption>
  <thead>
    <tr>
      <th scope="col">Invoice #</th>
      <th scope="col">Client</th>
      <th scope="col">Amount</th>
      <th scope="col">Action</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>FAC-2026-001</td>
      ...
    </tr>
  </tbody>
</table>
```

## 6.3 Keyboard Navigation

### Focus Management

```
Tab order:
1. Header navigation (logo, search, user menu)
2. Sidebar navigation items (top to bottom)
3. Main content area (forms, buttons, links, tables)
4. Footer (if present)

Within a form:
- Labels → Inputs → Helper text → Buttons
- Tab moves down, Shift+Tab moves up

Within a table:
- Table headers skip (not focusable unless sortable)
- Table cells navigable via Tab (if editable)
- Action buttons: Tab through each row

Keyboard shortcuts (optional):
- Ctrl+S / Cmd+S: Save form
- Escape: Close modal
- Alt+N: New invoice (when in main view)
- Alt+C: New client
- / : Open search (jump to search field)

Screen reader:
- Skip navigation link: "Skip to main content"
- Landmarks: <main>, <nav>, <section role="region">
- ARIA labels for icons (no visible text): <button aria-label="Close modal">✕</button>
```

### Focus Indicators

```
Style:
- Outline: 2px solid #2563EB (PRIMARY_BLUE)
- Outline-offset: 2px (visible separation from element)
- Border-radius: match element radius

Never remove default focus (::focus { outline: none }):
- Always provide custom visible focus indicator
- Minimum size: 4px (2px outline × 2 on each side)

Form field focus:
- Input: 2px blue outline
- Checkbox: 3px outline around element + internal check
- Radio: 3px outline around circle

Button focus:
- Outline: 2px solid blue
- Offset: 2px
- Example:
  ┌──────────────┐
  │ ┌──────────┐ │
  │ │  Button  │ │  ← 2px offset
  │ └──────────┘ │
  └──────────────┘
```

## 6.4 Text & Readability

### Font Sizing & Legibility

```
Body text: 16px minimum (14px only for secondary/helper text)
Line height: 1.5 for paragraphs, 1.6 for long text
Line length: 60-80 characters (optimal readability)

Mobile text: 16px minimum (prevents zoom-on-focus in mobile browsers)

Labels:
- Font-weight: 600 (semi-bold, improved clarity)
- Size: 14px (body-sm) to 16px (body-md)
- Color: #374151 (good contrast)

Links:
- Underlined or styled (never color alone)
- Focus: clear focus indicator
- Visited state: optional (purple #8B5CF6)
- Hover: color + underline

Lists:
- Bullet/numbered clear
- Indentation: 24px
- Gap between items: 8px (compact) to 12px (spacious)

Code/Monospace:
- Font: JetBrains Mono or Fira Code
- Size: 14px
- Background: light gray (#F3F4F6)
- Padding: 2px 4px (inline), 12px (block)
- Border-radius: 4px
```

### Text Alternatives

```
Images:
- All images must have alt text
- Format: descriptive but concise
- Example:
  ✓ alt="Invoice FAC-2026-001 PDF preview"
  ✗ alt="image" or alt="picture"

Icons (standalone):
- If icon-only button: use aria-label
- Example: <button aria-label="Close modal">✕</button>
- Or use title: <button title="Close modal">✕</button>

Charts:
- Summary text below chart
- Example: "Revenue increased 15% this month (€3,000)"
- Data table option: "View chart data as table"

PDF documents:
- Provide text alternative or transcription
- Example: "Invoice PDF [Download] - Text version available"
```

## 6.5 ARIA & Screen Reader Support

### ARIA Attributes Clés

```
aria-label:
- For icon buttons: <button aria-label="Delete invoice">🗑️</button>
- Replaces text when not visible
- Keep concise (2-3 words)

aria-labelledby:
- Link element to visible heading/label
- Example: <div id="modalTitle">Are you sure?</div>
           <dialog aria-labelledby="modalTitle">

aria-describedby:
- Additional description (not label)
- Example: <input aria-describedby="helpText">
           <span id="helpText">Format: SIRET (14 digits)</span>

aria-required:
- Mark required form fields
- Example: <input aria-required="true" required>

aria-invalid & aria-errormessage:
- Form validation states
- Example: <input aria-invalid="true" aria-errormessage="emailError">
           <span id="emailError">Invalid email format</span>

aria-live:
- Real-time updates (loading, success messages)
- Values: "polite", "assertive"
- Example: <div aria-live="polite" aria-label="Form status">
             Saving your invoice...
           </div>

aria-hidden:
- Hide decorative elements from screen reader
- Example: <span aria-hidden="true">→</span> (decoration arrow)

role:
- Override semantic meaning if needed
- Example: <div role="button"> (not recommended, use <button>)
- Better: <div role="status"> (for status messages)

Links & navigation:
- Use <nav> semantic element
- Breadcrumb: <nav aria-label="Breadcrumb">
- Skip link: <a href="#main" class="skip-link">Skip to main content</a>
```

## 6.6 Form Accessibility

### Form Field Labels

```
Best practice:
<div class="form-group">
  <label htmlFor="clientSelect">
    Select Client
    <span aria-label="required">*</span>
  </label>
  <select id="clientSelect" aria-required="true" required>
    <option>-- Choose --</option>
    ...
  </select>
  <span className="helper-text" id="clientHelp">
    Type to search by name or email
  </span>
</div>

Not accessible:
✗ <input placeholder="Email"> (placeholder alone not label)
✗ <input aria-label="Email"> (label not visible)
✗ Missing aria-required on required fields

Error handling:
<div className="form-group has-error">
  <label htmlFor="emailInput">Email *</label>
  <input
    id="emailInput"
    type="email"
    aria-invalid="true"
    aria-errormessage="emailError"
    required
  />
  <span id="emailError" role="alert" className="error">
    ⚠️ Invalid email format
  </span>
</div>

Success state:
<div className="form-group has-success">
  <label htmlFor="clientInput">Client *</label>
  <input
    id="clientInput"
    type="text"
    aria-describedby="clientSuccess"
    value="Claire Design"
  />
  <span id="clientSuccess" className="success">
    ✓ Client found
  </span>
</div>
```

---

# 7. Responsive Design

## 7.1 Breakpoints & Grid

### Tailwind Breakpoints Standard

```
Mobile (xs):   0px - 639px    (phones, small tablets)
Tablet (sm):   640px - 767px  (landscape phones)
Medium (md):   768px - 1023px (tablets)
Desktop (lg):  1024px - 1279px (small desktops, laptops)
Large (xl):    1280px - 1535px (desktops)
XL (2xl):      1536px+        (large monitors)

Application breakpoints:
- Mobile first approach
- Base styles: mobile (< 640px)
- sm:  (≥ 640px)  - landscape phones
- md:  (≥ 768px)  - tablets
- lg:  (≥ 1024px) - desktops
- xl:  (≥ 1280px) - large screens

Example:
- Sidebar visible on lg+, hidden on md- (hamburger menu instead)
- Grid: 1 col (mobile) → 2 col (tablet) → 3+ col (desktop)
- Padding: 20px (mobile) → 40px (desktop)
```

### Grid System

```
12-column grid base:
- Container: max-width varies by device
- Gutter: 16px (gap between columns)
- Margin: 20px (mobile), 40px (desktop)

Mobile (< 640px):
- Full width, no explicit grid
- Stack all components vertically
- Single column forms

Tablet (640px - 1023px):
- 2-column layout common
- Sidebar optional (can collapse)
- Grid 2 col for cards

Desktop (≥ 1024px):
- 3-column typical (sidebar + content + right panel)
- Grid 2-4 columns for content
- Sidebar sticky

Example usage (Tailwind):
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card /> {/* Auto-stacks on mobile, 2 cols on tablet, 3 on desktop */}
</div>
```

## 7.2 Layout Patterns

### Mobile-First Layout

#### Navigation
```
Mobile (< 1024px):
┌─────────────────────────┐
│ [≡] Logo     [Avatar▼]  │
└─────────────────────────┘
(Sidebar hidden, hamburger menu opens overlay)

Tablet (640px - 1023px):
┌──────────────────────────────────┐
│ [≡] Logo   Breadcrumb  [Avatar▼]│
├──────────┬──────────────────────┤
│ Sidebar  │ Content Area         │
│ Collapse │ (Hamburger toggles)  │
│ option   │                      │
└──────────┴──────────────────────┘

Desktop (≥ 1024px):
┌────────────────────────────────────────────┐
│ Logo  Breadcrumb           Search [Avatar▼]│
├─────────────┬──────────────────────────────┤
│             │ Content Area                 │
│  Sidebar    │ (full width available)       │
│  (visible,  │                              │
│   sticky)   │                              │
└─────────────┴──────────────────────────────┘
```

#### Form Layout
```
Mobile (< 640px):
Full width, stacked vertically
[Form label]
[Input field - full width]
[Helper text]
[Form label]
[Input field - full width]
[Buttons stacked]

Tablet (640px - 1023px):
2-column layout (50% width each)
[Label] [Label]
[Input] [Input]
[Label] [Label]
[Input] [Input]
[Buttons - full width or side-by-side]

Desktop (≥ 1024px):
2-3 column layout
[Label] [Label] [Label]
[Input] [Input] [Input]
[Buttons horizontal]
```

#### Card Layouts
```
Mobile (< 640px):
1 column, full width cards

┌─────────────────┐
│ Card 1          │
└─────────────────┘
┌─────────────────┐
│ Card 2          │
└─────────────────┘

Tablet (640px - 1023px):
2 columns

┌────────────┬────────────┐
│  Card 1    │  Card 2    │
├────────────┼────────────┤
│  Card 3    │  Card 4    │
└────────────┴────────────┘

Desktop (≥ 1024px):
3+ columns

┌────────────┬────────────┬────────────┐
│  Card 1    │  Card 2    │  Card 3    │
├────────────┼────────────┼────────────┤
│  Card 4    │  Card 5    │  Card 6    │
└────────────┴────────────┴────────────┘
```

## 7.3 Typography Scaling

### Responsive Font Sizes

```
Using CSS clamp() for fluid sizing:
(Scales smoothly between min and max)

h1: clamp(1.75rem, 5vw, 2.5rem)
    Mobile: 28px → Desktop: 40px (smooth transition)

h2: clamp(1.5rem, 4vw, 2rem)
    Mobile: 24px → Desktop: 32px

h3: clamp(1.25rem, 3vw, 1.5rem)
    Mobile: 20px → Desktop: 24px

Body: clamp(0.875rem, 2vw, 1rem)
      Mobile: 14px → Desktop: 16px

Alternatively (breakpoint-based):

h1: text-2xl (mobile) → sm:text-3xl → lg:text-4xl
Body: text-sm (mobile) → sm:text-base → lg:text-base
```

## 7.4 Viewport Considerations

### Viewport Meta Tag

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

- width=device-width: set width to device width
- initial-scale=1: no zoom on load
- viewport-fit=cover: safe area on notched devices
```

### Safe Areas (Notch Handling)

```
CSS environment variables (iOS):
- env(safe-area-inset-top)     : distance from top notch
- env(safe-area-inset-bottom)  : safe area from bottom (home indicator)
- env(safe-area-inset-left)    : safe area left (landscape notch)
- env(safe-area-inset-right)   : safe area right (landscape notch)

Usage:
.top-bar {
  padding-top: calc(20px + env(safe-area-inset-top));
}

.bottom-actions {
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
}
```

### Touch & Mobile Interaction

```
Touch target size: 44x44px minimum (WCAG AAA)
- Buttons: 48x48px ideal
- Icons: 20px icon + 12px padding = 44px total

Touch spacing:
- Gap between touch targets: 8px minimum
- Larger on mobile (easier to tap)

Gestures:
- Tap: equivalent to click
- Swipe: navigation (mobile menu, mobile tables)
- Pinch: zoom (allowed by default)
- Long-press: context menu (right-click alternative)

Mobile interactions:
- Remove hover states (no hover on touch)
- Replace with active/pressed states
- Use focus states after tap (visual feedback)
- Allow up to 500ms for double-tap detection

Form considerations:
- Large input fields (48px+ height)
- Avoid autofocus (opens keyboard)
- Allow zoom (don't disable with user-scalable=no)
- Submit button: sticky bottom on mobile
```

---

# 8. Patterns UX États Critiques

## 8.1 Loading States

### Loading Skeletons

```
Invoice List Loading:

┌──────────────────────────────────────┐
│ [████████████] (Loading invoices...) │
├─────────┬───────────┬────────────────┤
│ [████]  │ [████]    │ [████] [████]  │
│ [████]  │ [████]    │ [████] [████]  │
│ [████]  │ [████]    │ [████]         │
├─────────┼───────────┼────────────────┤
│ [████]  │ [████]    │ [████] [████]  │
│ [████]  │ [████]    │ [████] [████]  │
│ [████]  │ [████]    │ [████]         │
└─────────┴───────────┴────────────────┘

Skeleton style:
- Background: #E5E7EB (light gray)
- Border-radius: 4px
- Shimmer animation: subtle fade pulse
- Duration: 1.5s infinite
- Lines: staggered (top line shorter than others)

Form Loading:
┌────────────────────────────────┐
│ Select Client *                │
│ [████████████████] (loading..) │
│                                │
│ Issue Date *   Due Date *      │
│ [████] [████] [████] [████]   │
│                                │
│ [████████████████████████]    │
│ [████████████████████████]    │
│ [████████████████████████]    │
│                                │
│ [████████]       [████████]   │
└────────────────────────────────┘
```

### Spinner/Progress Indicator

```
Inline loader (for buttons):
[🔄 Saving...]  ← spinning icon

Centered loader (full page):
      🔄
    Saving your invoice...
    Please wait...

Styles:
- Spinner: 24px size, 2px stroke, blue color
- Text: secondary color, "Saving..." / "Loading..."
- Duration: 200ms entrance, smooth spin loop

Progress bar (for file uploads):
Upload logo...
[████████░░░░░░░░░░░░░░░░░░░░] 35% (~2.5MB / 7MB)
[Cancel]
```

## 8.2 Error States

### Form Validation Errors

```
Real-time validation (as user types):
Email *
[invalid-email@example    ✗]
⚠️ Invalid email format

OR (after blur):
Email *
[invalid-email@example]
⚠️ Invalid email format (shown below)

Error characteristics:
- Red color: #EF4444
- Icon: ⚠️ or ✗ (red)
- Message text: clear, actionable
- Below field OR inline (space permitting)
- Focus: immediately visible

Examples of good error messages:
✓ "Email is invalid. Please check the format."
✓ "This email is already registered. Did you mean to sign in?"
✓ "Password must be at least 8 characters."
✗ "Invalid input"
✗ "Error" (too vague)

Field-level error styling:
.form-field.error {
  border-color: #EF4444;
  background-color: #FEF2F2;
}
.form-field.error input:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  border-color: #EF4444;
}

Form submission error (global):
┌────────────────────────────────────────┐
│ ✕ Please fix the following errors:     │
│ • Email: Invalid format                 │
│ • SIRET: Must be 14 digits              │
│ • Terms: You must accept terms          │
│ [Dismiss] [Edit]                        │
└────────────────────────────────────────┘

Toast error notification:
┌─────────────────────────────────────┐
│ ✕ Failed to save invoice            │
│ Please try again or contact support │
│ [Retry] [Dismiss]                   │
└─────────────────────────────────────┘
```

### Server Errors (HTTP 500, Timeout, etc.)

```
Network error modal:
┌──────────────────────────────────────┐
│ ⚠️ Something went wrong               │
├──────────────────────────────────────┤
│ We couldn't connect to the server.    │
│ Please check your internet and try    │
│ again, or contact support.            │
│                                       │
│ Error ID: 8a3c5e7f (for support)     │
│                                       │
│ [← Go Back] [Retry] [Contact Support]│
└──────────────────────────────────────┘

Timeout error:
┌──────────────────────────────────────┐
│ ⏱️ Request timed out                  │
├──────────────────────────────────────┤
│ Your request took too long. Please    │
│ try again.                            │
│                                       │
│ [Retry] [Cancel]                     │
└──────────────────────────────────────┘

Offline detection:
┌──────────────────────────────────────┐
│ 📶 You appear to be offline          │
│ Changes will be saved when you're     │
│ back online.                          │
│ [Retry] [Dismiss]                    │
└──────────────────────────────────────┘
```

## 8.3 Empty States

### Empty List

```
When no invoices:
┌────────────────────────────────────────────────┐
│                                                │
│                    📄                          │
│             No invoices yet                    │
│                                                │
│    Create your first invoice to get started.   │
│                                                │
│             [+ Create Invoice]                 │
│                                                │
│     Or check out our guide: "Getting Started"  │
│                                                │
└────────────────────────────────────────────────┘

When no search results:
┌────────────────────────────────────────────────┐
│ [Search: "xyz"]                                │
│                                                │
│                    🔍                          │
│          No invoices found                     │
│                                                │
│    Try different search terms or filters.      │
│                                                │
│  [Clear Search] [Create New Invoice]           │
│                                                │
└────────────────────────────────────────────────┘

Empty state characteristics:
- Large icon (64px): contextual (document, search, etc.)
- Heading: clear, friendly
- Subheading: explanation
- CTA button: primary action
- Link: secondary action or documentation
- Illustration/color: optional but recommended
```

### Empty Dashboard (New User)

```
First-time user dashboard:
┌──────────────────────────────────────────────┐
│ Welcome, Claire!                             │
│ Let's get you set up in a few steps.         │
│                                              │
│ 1. ✓ Create account (completed)              │
│ 2. ○ Add first client                        │
│ 3. ○ Create first invoice                    │
│ 4. ○ Send invoice                            │
│                                              │
│ [Next: Add Client] [Skip Setup]              │
│                                              │
│ ──────────────────────────────────────────  │
│                                              │
│ Or jump right in:                            │
│ [+ New Client] [+ New Invoice]               │
│                                              │
│ Learn more: [Tour] [FAQ] [Contact]           │
│                                              │
└──────────────────────────────────────────────┘
```

## 8.4 Success States

### Action Success

```
Inline success (form field):
SIRET *
[12345678901234] ✓
Client found: Acme Corp

Success toast (temporary notification):
┌─────────────────────────────────────┐
│ ✓ Invoice created successfully       │
│                                      │
│ [View Invoice] [Create Another] [✕] │
└─────────────────────────────────────┘
Auto-dismiss after 4 seconds

Success modal (major action):
┌──────────────────────────────────────┐
│ ✓ Invoice created!                   │
├──────────────────────────────────────┤
│ FAC-2026-001 is ready to send.       │
│                                      │
│ Amount: €2,500.00                    │
│ Client: Claire Design                │
│ Due: 18 Mar 2026                     │
│                                      │
│ [Download PDF] [Send Email] [Done]   │
└──────────────────────────────────────┘

Success state characteristics:
- Green checkmark (✓) icon
- Green color (#10B981) - but verify contrast with text
- Friendly, affirming tone
- Clear next steps
- Action button (not just dismiss)
```

### Undo Confirmation

```
After deletion soft-delete:
┌─────────────────────────────────────┐
│ ✓ Invoice archived                   │
│                                      │
│ [Undo] [View Archived]  [✕]         │
└─────────────────────────────────────┘
Undo button active for 5 seconds only

Undo modal:
┌──────────────────────────────────────┐
│ ✓ Invoice FAC-2026-003 archived     │
├──────────────────────────────────────┤
│ This invoice has been moved to       │
│ archived invoices. You can still:    │
│                                      │
│ • View the invoice                   │
│ • Restore it to active               │
│ • Delete it permanently (after 30d)  │
│                                      │
│ [Restore] [View Archived] [Done]     │
└──────────────────────────────────────┘
```

## 8.5 Conflict & Data States

### Conflict Resolution (Concurrent Edit)

```
User A and User B both editing same invoice (rare in single-user, but planned for multi-user v3):

┌──────────────────────────────────────┐
│ ⚠️ Invoice has been modified         │
├──────────────────────────────────────┤
│ Another user (Marc) has updated this │
│ invoice since you started editing.   │
│                                      │
│ Your changes:                        │
│ • Amount: €3,960.00                  │
│                                      │
│ Latest changes:                      │
│ • Amount: €4,200.00                  │
│ • Due Date: 20 Mar 2026              │
│                                      │
│ [Merge Changes] [Discard] [Contact]  │
└──────────────────────────────────────┘

Merge Changes flow:
1. Show side-by-side diff
2. User selects which version for each field
3. Save merged result
4. Show confirmation
```

### Offline Data Sync

```
User saves while offline:
┌─────────────────────────────────────┐
│ 📶 Saved locally (offline)          │
│                                      │
│ Your changes are queued to sync      │
│ when you're back online.             │
│ [Dismiss]                            │
└─────────────────────────────────────┘

User comes back online:
┌─────────────────────────────────────┐
│ ✓ You're online again!              │
│                                      │
│ Syncing 3 changes...                 │
│ [████████████░░░░░░░░░░░░░░░░] 50%  │
│                                      │
│ [View Changes]                       │
└─────────────────────────────────────┘

Sync complete:
┌─────────────────────────────────────┐
│ ✓ All changes synced successfully   │
│                                      │
│ • Invoice FAC-2026-001 updated      │
│ • Client "Acme" created             │
│ • Invoice marked as paid             │
│                                      │
│ [Dismiss]                            │
└─────────────────────────────────────┘
```

---

# 9. Micro-interactions & Feedback

## 9.1 Visual Feedback Hierarchy

### Immediate Feedback (< 100ms)

```
Button click:
1. Visual state change: :active (darker color, slight scale)
2. Ripple effect (optional, 200ms): Material Design ripple from click point
3. Loading state (if action > 200ms): spinner appears after 200ms

Form input:
1. Focus border/shadow (instant)
2. Placeholder fade out (optional, immediate)
3. Character counter update (instant, no animation)
4. Validation icon appear (instant, no animation)

Keyboard input:
1. Character appears in field (instant, system)
2. Validation feedback (real-time, < 50ms)
3. Suggestions appear (100-200ms debounce)
```

### Persistent Feedback (> 1s)

```
Toast notifications:
- Entrance: 200ms (slide in from top, fade in)
- Duration: 4 seconds (visible)
- Exit: 150ms (fade out, slide up)
- Position: top center (desktop), top full-width (mobile)

Modal confirmation:
- Entrance: 300ms (scale in, fade in)
- User action: wait for response (no timeout)
- Exit: 150ms (scale out, fade out)
- No auto-dismiss (user must choose)

Success checkpoint:
- Show result: 300ms animation
- Persist: 3-4 seconds
- Offer next action: button/link alongside dismiss
```

## 9.2 Animation Hierarchy

### Critical User Paths

```
High-priority animations (smooth, noticeable):
1. Form submission → loading → success/error (300-500ms total)
2. Modal open/close (300ms)
3. Navigation page transition (200ms)
4. Invoice status change (200ms confirmation + animation)

Medium-priority animations (subtle, under 200ms):
1. Button hover effects (100-200ms)
2. Dropdown menu appearance (150ms)
3. Checkbox/radio state change (100ms)
4. Tooltip appearance (100ms)

Low-priority animations (micro, 50-100ms):
1. Icon rotations (chevron expand, sort arrows)
2. Color transitions on hover (100ms)
3. Text field error appearance (50ms)
4. Notification dot blink (optional)
```

### Easing Functions

```
Entrance animations (slower in, snappier out):
cubic-bezier(0.16, 1, 0.3, 1) - spring-like
or cubic-bezier(0.34, 1.56, 0.64, 1) - overshoot spring

Transition animations (balanced):
cubic-bezier(0.4, 0, 0.2, 1) - standard easing
or ease-in-out

Exit animations (quick):
cubic-bezier(0.4, 0, 0.6, 0.2) - snappy

Color/size transitions:
ease-out (standard)

Position transitions (movement):
cubic-bezier(0.25, 0.46, 0.45, 0.94) - fluid

No animation:
transition: none (for disabled states, data updates)
```

## 9.3 Haptic Feedback (Mobile)

### Haptic Patterns

```
Light tap:
- Confirm action completed
- Success, form submission
- navigator.vibrate([50])

Medium tap (tactile):
- Confirm important action
- Deletion, major state change
- navigator.vibrate([100])

Heavy tap:
- Warning/alert
- Error state
- navigator.vibrate([200])

Pattern (sequence):
- Rapid success: [50, 100, 50]
- Alert: [100, 50, 100, 50]

Usage:
if ('vibrate' in navigator) {
  navigator.vibrate([50]); // Light tap
}

Mobile considerations:
- Haptic disabled by default in Safari (requires user gesture)
- Use sparingly (battery impact)
- Always test with real device
```

---

# 10. Performance & Perception

## 10.1 Perceived Performance

### Loading State Best Practices

```
Show progress visually:
- Skeleton screens (better than blank)
- Progress bar (if deterministic)
- Loading message (contextual: "Loading invoices...")

Optimize for time perception:
- 0-100ms: feels instant (no feedback needed)
- 100-300ms: show brief loading state
- 300ms-1s: show substantial progress
- 1s+: allow cancel option, show time remaining estimate

For file uploads (e.g., logo):
- Show progress bar: [████████░░░░░░░░░] 45%
- Show file size: (2.5MB / 7MB)
- Allow cancel during upload
- Show % and time remaining

For form submissions:
- Disable button + show spinner immediately
- Show "Saving..." text
- On error: show error, re-enable button, keep form intact
- On success: show confirmation, suggest next action
```

### Optimistic Updates

```
Mark invoice as paid (optimistic):
1. User clicks "Mark Paid"
2. Button: immediately shows checkmark
3. Status badge: instantly changes to "PAID" (green)
4. Dashboard KPI: instantly updates (optimistic)
5. In background: POST request to server
6. On server response:
   - Success: confirm (no visual change, data matches)
   - Error: revert to previous state, show error toast
   - Example: "Failed to mark as paid. [Retry]"

Benefit:
- Feels instant (no waiting)
- Reduces perceived latency by 200-500ms

Fallback:
- If server error, revert optimistic update
- Keep undo available (can change back)
- Clear communication: "Changes not saved" / "Retrying..."
```

## 10.2 Performance Budgets

### Load Time Targets

```
First Contentful Paint (FCP): < 1.5s
  - First pixel of content visible
  - Target: < 1.5s on 4G mobile

Largest Contentful Paint (LCP): < 2.5s
  - Largest content block visible
  - Target: < 2.5s on 4G mobile

Cumulative Layout Shift (CLS): < 0.1
  - Measure visual stability
  - No unexpected layout shifts

Interaction to Next Paint (INP): < 200ms
  - Responsiveness (upcoming Core Web Vital)
  - Button click → visual feedback < 200ms

Time to Interactive (TTI): < 3.5s
  - Page is interactive (buttons work)
  - Target: < 3.5s on 4G mobile

API Response Times:
- p50: < 100ms (median)
- p95: < 200ms (95th percentile)
- p99: < 500ms (worst case)

Asset Size Budget:
- JavaScript: < 150KB (gzipped)
- CSS: < 50KB (gzipped)
- Fonts: < 100KB (total)
- Images: < 500KB per page
- PDF generation: < 3s server-side
```

## 10.3 Progressive Enhancement

### Core Functionality Without JavaScript

```
HTML-only fallback (graceful degradation):
- Form submission: POST without AJAX
- Navigation: server-side routing
- Validation: browser native (pattern, required)

JavaScript enhancement layers:
1. HTML base: works without JS
2. Progressive enhancement: add JS for UX
   - Form validation before submit
   - Inline error display
   - Dropdown menus (keyboard accessible)
   - Modal dialogs
   - Dynamic form updates (line item calculations)

Client-side only (requires JS):
- Invoice PDF preview (heavy rendering)
- Real-time search suggestions
- Auto-save functionality
- Collaborative features (future)

Minimal JS apps:
- Avoid JavaScript where possible
- Use native HTML/CSS for layouts
- JS only for interactions beyond HTML scope
```

## 10.4 Accessibility Performance

### Minimum Performance Standards

```
Do NOT optimize at the cost of accessibility:

WRONG:
- Remove focus indicators "for performance" ✗
- Lazy-load important form labels ✗
- Remove semantic HTML (use divs) ✗
- Avoid alt-text on images ✗

RIGHT:
- Keep focus outlines (no performance impact)
- Load page structure eagerly
- Use semantic HTML (< 1KB impact)
- Include alt-text (SEO + accessibility)

Accessibility + Performance:
- Semantic HTML: smaller JS bundle (no framework shims)
- alt-text: text content (searchable, indexable)
- Keyboard nav: no mouse required (fast on some devices)
- Focus visible: browser default, no custom CSS needed
- Color + text: works even if CSS fails
```

---

# Appendix A: Design Tokens (Figma/Code)

## Color Tokens

```json
{
  "colors": {
    "primary": {
      "50": "#eff6ff",
      "100": "#dbeafe",
      "200": "#bfdbfe",
      "300": "#93c5fd",
      "400": "#60a5fa",
      "500": "#3b82f6",
      "600": "#2563eb",
      "700": "#1d4ed8",
      "800": "#1e40af",
      "900": "#1e3a8a"
    },
    "success": {
      "50": "#f0fdf4",
      "500": "#10b981",
      "600": "#059669"
    },
    "error": {
      "50": "#fef2f2",
      "500": "#ef4444",
      "600": "#dc2626"
    }
  }
}
```

## Typography Tokens

```json
{
  "typography": {
    "h1": {
      "fontSize": "40px",
      "fontWeight": 700,
      "lineHeight": 1.2
    },
    "body": {
      "fontSize": "16px",
      "fontWeight": 400,
      "lineHeight": 1.6
    }
  }
}
```

---

# Appendix B: Component Template

## Button Component Spec

```
Name: Button (Primary)
States: Default, Hover, Active, Focus, Disabled
Sizes: xs, sm, md (default), lg, xl
Variants: Primary, Secondary, Danger, Ghost

Props:
- label: string (button text)
- onClick: function
- disabled: boolean
- size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- variant: 'primary' | 'secondary' | 'danger' | 'ghost'
- type: 'button' | 'submit' | 'reset'
- icon: ReactNode (optional)
- loading: boolean (shows spinner)

Accessibility:
- aria-label (if icon-only)
- aria-pressed (if toggle)
- aria-disabled (if disabled)
- title attribute (if needed)

HTML:
<button
  className="btn btn-primary btn-md"
  onClick={handleClick}
  aria-label="Create invoice"
>
  + Create Invoice
</button>
```

---

**Spécification UX - Fin du document**

**Version:** 1.0  
**Date:** 16 février 2026  
**Status:** ✓ COMPLÈTE  
**Next Review:** Après feedback design team  

**À utiliser avec:** 02_prd.md, Figma designs, Component Library

---
