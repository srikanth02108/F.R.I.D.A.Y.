---
name: Executive Precision
colors:
  surface: '#fbf9f8'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#46464b'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#77777c'
  outline-variant: '#c7c6cb'
  surface-tint: '#5d5e65'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#191b22'
  on-primary-container: '#82838b'
  inverse-primary: '#c5c6ce'
  secondary: '#003fd8'
  on-secondary: '#ffffff'
  secondary-container: '#2558ff'
  on-secondary-container: '#eaebff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002112'
  on-tertiary-container: '#009763'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2eb'
  primary-fixed-dim: '#c5c6ce'
  on-primary-fixed: '#191b22'
  on-primary-fixed-variant: '#45464e'
  secondary-fixed: '#dde1ff'
  secondary-fixed-dim: '#b8c4ff'
  on-secondary-fixed: '#001355'
  on-secondary-fixed-variant: '#0036bc'
  tertiary-fixed: '#6ffcb7'
  tertiary-fixed-dim: '#4fdf9d'
  on-tertiary-fixed: '#002112'
  on-tertiary-fixed-variant: '#005233'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
  ats-emerald: '#0EB87A'
  azure-vibrant: '#2055FD'
  deep-obsidian: '#0A0A0A'
  slate-gray: '#6B6B6B'
  latex-paper: '#FFFFFF'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  button-text:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is engineered for a high-performance career platform that bridges the gap between technical LaTeX precision and human-centric career growth. The brand personality is **authoritative, meticulous, and empowering**. It targets ambitious professionals in the Indian market who require an edge in competitive corporate environments.

The visual style is **Corporate Modern with Glassmorphism accents**. It prioritizes extreme legibility and a sense of "Real-World Industry" readiness. The interface uses a sophisticated balance of deep, saturated neutrals to provide a stable foundation, while vibrant accents signal AI-driven insights and success metrics. Depth is achieved through layered surfaces and frosted glass effects rather than heavy skeuomorphism, maintaining a clean, high-velocity feel.

## Colors

The palette is anchored by **Deep Obsidian** and **Deep Navy**, establishing a baseline of professional trust and "LaTeX" formality. 

- **Primary:** Used for core branding, headers, and primary navigation to ground the experience in authority.
- **Secondary (Azure Vibrant):** Used for primary actions, progress indicators, and AI-driven feature highlights. It provides the "high-performance" energy.
- **Tertiary (ATS Emerald):** Reserved specifically for "Success" states, high ATS scores, and interview-ready indicators.
- **Neutral:** A range of cool grays used for secondary text and subtle borders to ensure the focus remains on the user's content.

The default mode is **Light**, mimicking the physical paper and digital PDF environments where resumes live, ensuring visual fidelity between the builder and the final output.

## Typography

This design system utilizes **Plus Jakarta Sans** for all primary interface elements. Its geometric but approachable letterforms provide a modern corporate feel that is less sterile than traditional grotesques. 

To emphasize the "LaTeX Precision" and AI-technical aspect of the product, **JetBrains Mono** is employed for labels, ATS scores, and metadata. This creates a functional contrast, signaling where data and algorithms are at work.

Hierarchy is enforced through tight tracking on larger headlines and generous line heights for body copy to ensure readability during long editing sessions.

## Layout & Spacing

The design system employs a **12-column fluid grid** for desktop, transitioning to a 4-column grid for mobile devices. 

- **Spacing Rhythm:** Based on a 4px baseline (8pt grid system). All margins, paddings, and gaps must be multiples of 4px.
- **Layout Model:** High-density content areas (like the resume editor) use a "sidebar-main" split layout. Sidebars should be fixed-width (320px) while the main canvas scales.
- **Breathing Room:** Use generous external margins (40px+) on desktop to create a premium, editorial feel that avoids the "cluttered tool" aesthetic common in budget builders.

## Elevation & Depth

Visual hierarchy is managed through **Tonal Layering** and **Subtle Glassmorphism**:

1.  **Level 0 (Base):** The canvas/background, using `#FFFFFF` or a very faint cool gray.
2.  **Level 1 (Cards/Sections):** White surfaces with a 1px border (`#E2E8F0`) and a very soft, high-diffusion shadow: `0px 4px 20px rgba(15, 17, 23, 0.04)`.
3.  **Level 2 (Modals/Popovers):** These utilize a **Backdrop Blur (12px)** and semi-transparent white backgrounds (`rgba(255, 255, 255, 0.8)`) to create a sophisticated glass effect that maintains context.
4.  **Interactive States:** On hover, elements should slightly lift with an increased shadow spread and a subtle border color shift to the Secondary Azure color.

## Shapes

The shape language is **Refined and Intentional**. 

A `0.5rem` (8px) corner radius is the standard for cards, input fields, and buttons. This "Rounded" setting provides a professional balance—soft enough to feel modern and accessible, but sharp enough to maintain corporate discipline. 

- Small components (Chips/Tags) should use `rounded-lg` (16px).
- Full "Pill" shapes are reserved strictly for status indicators like "ATS Score" or "Active" to make them instantly recognizable as non-interactive data points.

## Components

### Buttons
- **Primary:** Solid `Primary Color` (Deep Obsidian) with White text. High-contrast, sharp, and commanding.
- **Action:** Solid `Secondary Color` (Azure) for the "Build" or "Download" actions.
- **Ghost:** No background, `Secondary Color` text, used for secondary navigation or "Cancel" actions.

### Inputs & Fields
- **Styling:** 1px border (`#D1D5DB`), 8px radius. On focus, the border transitions to Azure with a subtle 3px outer glow in 10% opacity Azure.
- **Labels:** Use `label-mono` (JetBrains Mono) above fields to denote the "data-entry" nature of the task.

### ATS Scorer (Proprietary Component)
- A circular or semi-circular gauge using `ATS Emerald`.
- Background of the gauge should be a very light tint of the emerald or a glass-morphic surface.

### Cards
- Used to house resume sections or interview tips. Minimalist with no heavy borders; rely on Level 1 elevation (soft shadows) and generous internal padding (24px).

### List Items
- Career timeline items should use a vertical "thread" or line in `Slate Gray` to connect experiences, reinforcing the LaTeX-style structured data look.