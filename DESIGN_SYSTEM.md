# Unmute Design System

## Overview

Unmute is a premium AI-powered interview preparation platform designed to make people feel prepared, confident, and supported. The product should feel polished, calm, and intelligent—more like a trusted coach than a generic SaaS dashboard.

This document is the single source of truth for design decisions across the product. It should be used by designers, developers, and GitHub Copilot when generating UI, components, layouts, and product flows.

---

## 1. Brand Identity

### Product Vision
Unmute helps candidates practice, improve, and perform with confidence through AI-driven interview coaching, feedback, and progress tracking. The experience should feel modern, motivating, and deeply human.

### Design Principles
- Clarity first: interfaces should be simple, readable, and easy to understand.
- Calm confidence: interactions should feel reassuring, not overwhelming.
- Premium minimalism: remove clutter and elevate the core experience.
- Human warmth: the product should feel friendly, encouraging, and supportive.
- Accessibility by default: every experience should be inclusive and keyboard-friendly.
- Consistency over novelty: use repeatable patterns, clear hierarchy, and restrained visual expression.

### User Experience Goals
- Help users feel prepared in under a minute.
- Reduce friction in onboarding, practice, and feedback review.
- Make progress visible and motivating.
- Create a premium experience that feels trustworthy and polished.
- Support both quick actions and deep workflows without visual noise.

---

## 2. Color Palette

The palette is centered on teal and emerald to communicate calm confidence, clarity, and growth. It should be used consistently across surfaces, components, and charts.

### Core palette

- Primary: #0F766E
  - Use for primary buttons, active states, key CTAs, primary links, and important highlights.

- Secondary: #10B981
  - Use for supporting actions, success moments, progress states, and secondary emphasis.

- Accent: #14B8A6
  - Use for highlights, active selections, badges, and subtle emphasis where the interface needs energy without becoming loud.

- Light Accent: #CCFBF1
  - Use for soft backgrounds, selected states, tag backgrounds, and low-contrast highlight surfaces.

### Neutral palette

- Background: #F8FAFC
  - Use as the main app background for pages, sections, and large surfaces.

- Surface: #FFFFFF
  - Use for cards, panels, modals, sidebars, and elevated containers.

- Primary Text: #111827
  - Use for headings, labels, and primary content.

- Secondary Text: #6B7280
  - Use for helper text, muted metadata, descriptions, and secondary labels.

- Border: #E5E7EB
  - Use for dividers, input borders, card outlines, and subtle structural separation.

### Status palette

- Success: #22C55E
  - Use for completed states, positive feedback, successful actions, and progress completion.

- Warning: #F59E0B
  - Use for pending review states, caution messages, and attention-needed indicators.

- Error: #EF4444
  - Use for validation issues, destructive actions, and critical failures.

### Color usage guidelines
- Reserve the primary color for primary actions and the most important UI elements.
- Use surface and background deliberately to create hierarchy.
- Avoid mixing unrelated bright colors into the system.
- For charts, use only the approved teal/emerald palette.
- Do not use purple, pink, or unrelated accent colors in charts or data visualizations.

---

## 3. Typography

### Font
- Primary font: Geist
- Use Geist for all UI, headings, labels, and body copy.
- The font should feel polished, slightly technical, and modern without being cold.

### Type scale

- Hero
  - Size: 48px desktop / 36px tablet / 30px mobile
  - Weight: 700
  - Line height: 1.1
  - Use for landing page hero titles and major marketing moments.

- Page Title
  - Size: 32px desktop / 28px tablet / 24px mobile
  - Weight: 600
  - Line height: 1.2
  - Use for main screen titles such as Dashboard, Interviews, Settings.

- Section Title
  - Size: 20px
  - Weight: 600
  - Line height: 1.3
  - Use for grouped content sections and panel headings.

- Card Title
  - Size: 16px
  - Weight: 600
  - Line height: 1.4
  - Use for card headers and summary labels.

- Body
  - Size: 14px or 15px
  - Weight: 400 or 500
  - Line height: 1.5 or 1.6
  - Use for body copy, descriptions, and paragraph content.

- Caption
  - Size: 12px
  - Weight: 400 or 500
  - Line height: 1.4
  - Use for metadata, hints, helper text, and table labels.

- Button Text
  - Size: 14px
  - Weight: 500
  - Line height: 1
  - Use for all button labels.

### Typography rules
- Maintain strong contrast between headings and body copy.
- Prefer concise, direct wording.
- Avoid long paragraphs in dashboard interfaces.
- Use sentence case for headings and labels.

---

## 4. Spacing System

Use a consistent 4px spacing grid to ensure rhythm and alignment.

### Core spacing scale
- 4px
- 8px
- 12px
- 16px
- 24px
- 32px
- 40px
- 48px
- 64px
- 80px
- 96px

### Layout spacing
- Section spacing: 64px desktop, 48px tablet, 32px mobile
- Card padding: 20px desktop, 16px mobile
- Container width: max 1280px
- Grid gaps: 16px for standard layouts, 24px for dense dashboard sections

### Layout guidance
- Use consistent spacing between sections and components.
- Keep content groups aligned to the 4px grid.
- Avoid uneven padding and arbitrary spacing values.

---

## 5. Border Radius

The product should feel soft, polished, and modern without being overly rounded.

- Buttons: 10px
- Inputs: 10px or 12px
- Cards: 16px
- Dialogs: 20px
- Avatars: full circle or 999px

### Radius rules
- Use slightly rounded corners for all interactive surfaces.
- Keep dialogs and major containers more rounded than small controls.
- Maintain consistency across similar components.

---

## 6. Elevation

Elevation should be subtle and deliberate. The UI should feel premium without relying on heavy shadows.

### Card shadows
- Use a soft neutral shadow with low blur and low spread.
- Example: rgba(15, 23, 42, 0.04) 0px 10px 30px

### Hover shadows
- Increase shadow slightly on hover.
- The elevation change should feel light and polished, not dramatic.

### Modal shadows
- Use a stronger shadow for dialogs and overlays.
- Keep the shadow soft and diffused to preserve clarity.

### Elevation principles
- Cards should feel lifted but not floating aggressively.
- Hover states should communicate interactivity without excessive motion.

---

## 7. Buttons

Buttons should be clear, accessible, and visually calm. They should communicate hierarchy without visual noise.

### Button variants

#### Primary
- Background: #0F766E
- Text: #FFFFFF
- Use for primary CTA actions such as Start Practice, Continue, Save, Submit.
- Hover: slightly darker teal
- Active: pressed state with subtle scale or translate
- Disabled: reduced opacity and no hover state

#### Secondary
- Background: #10B981
- Text: #FFFFFF
- Use for supporting actions or secondary emphasis.
- Hover: slightly brighter or deeper green
- Active: slightly darker shade
- Disabled: reduced opacity

#### Outline
- Background: transparent
- Border: #E5E7EB
- Text: #111827
- Use for less prominent actions, navigation actions, and secondary CTAs.
- Hover: light teal background and subtle border tint
- Active: soft filled state
- Disabled: muted text and border

#### Ghost
- Background: transparent
- Text: #111827 or #6B7280
- Use for icon buttons, inline actions, and low-emphasis controls.
- Hover: light neutral or soft teal fill
- Active: slightly stronger fill
- Disabled: reduced opacity

#### Destructive
- Background: #EF4444 with white text
- Use for delete, remove, or irreversible actions.
- Hover: deeper red
- Active: pressed state
- Disabled: reduced opacity

### Button standards
- Minimum height: 40px for standard buttons
- Icon spacing: 8px gap
- Rounded corners: 10px
- Use visible focus ring on keyboard navigation
- Avoid overly large buttons in dense dashboard areas

---

## 8. Forms

Forms should be clear, approachable, and easy to scan.

### Input
- Background: #FFFFFF
- Border: #E5E7EB
- Text: #111827
- Placeholder: #6B7280
- Height: 44px
- Rounded corners: 10px
- Use subtle border and strong focus ring

### Textarea
- Background: #FFFFFF
- Border: #E5E7EB
- Min height: 120px
- Padding: 12px 14px
- Rounded corners: 12px

### Dropdown
- Match input styling
- Use a clear chevron affordance
- Keep menu items spaced and readable
- Use hover states with soft teal or neutral tint

### Checkbox and Radio
- Use teal accent for selected states
- Border color: #E5E7EB when unselected
- Selected color: #0F766E
- Provide clear spacing and visible focus states

### File Upload
- Use a rounded card-style upload area with soft border and dashed outline
- Include clear label and helper text
- Support drag-and-drop with visible hover state
- Show error or success message inline

### Error states
- Border color: #EF4444
- Helper text: #EF4444
- Show inline message under the field
- Avoid relying on color alone; include clear text

### Focus states
- Use a visible focus ring in teal/emerald
- Focus should be obvious and consistent across all inputs and controls

---

## 9. Cards

Cards should feel structured, calm, and slightly elevated. They should help users scan information quickly while maintaining a premium feel.

### Dashboard cards
- Background: #FFFFFF
- Padding: 20px
- Border radius: 16px
- Border: 1px solid #E5E7EB
- Shadow: soft neutral elevation
- Use for summary panels, modules, and key widgets

### Stats cards
- Emphasize numerical values and simple labels
- Use one main metric and optional trend indicator
- Keep copy minimal and high contrast
- Use subtle accent color in the top or icon area

### AI recommendation cards
- Use a soft teal background or light accent tint for emphasis
- Include a short recommendation title, supporting description, and action CTA
- Keep the layout concise and useful

### Interview cards
- Show interview title, status, topic, and next action
- Use strong hierarchy and clear action buttons
- Maintain spacing and visual consistency across the list

### Feedback cards
- Use clear structure: summary, insight, and next steps
- Highlight key takeaways with concise text blocks
- Avoid dense paragraphs and keep each card scannable

---

## 10. Navigation

Navigation should be simple, unobtrusive, and always easy to understand.

### Navbar
- Background: #FFFFFF with subtle border bottom
- Height: 72px
- Use clear spacing and a calm, minimal structure
- Include product name, primary navigation, and user actions
- Keep the top bar visually light and uncluttered

### Sidebar
- Background: #FFFFFF
- Width: 240px desktop
- Use subtle section dividers and clear vertical spacing
- Keep each item aligned and easy to scan

### Active menu item
- Background: #CCFBF1 or soft teal tint
- Text: #0F766E
- Use a left indicator or filled background to show selection clearly

### Breadcrumbs
- Use small text with muted color
- Separate levels with slashes or chevrons
- Keep breadcrumbs lightweight and secondary to primary content

---

## 11. Charts

Charts should reinforce the product’s calm and trustworthy identity. Use only the approved teal/emerald palette.

### Allowed chart colors
- #0F766E
- #10B981
- #14B8A6
- #CCFBF1
- #22C55E

### Chart guidelines
- Avoid purple, pink, or unrelated colors entirely.
- Use light accent for background fills and stronger teal tones for primary series.
- Keep chart labels readable and minimal.
- Use consistent line thickness and legend styling.
- Prefer clear, simple visualizations over decorative complexity.

---

## 12. Icons

Use Lucide icons exclusively.

### Icon standards
- Style: outline icons with rounded stroke endings
- Stroke width: 1.75px for regular UI, 1.5px for compact controls
- Size: 16px for inline UI, 20px for standard icons, 24px for feature or hero visuals
- Keep icon weight consistent across the product

### Icon usage guidance
- Use icons to support meaning, not decorate unnecessarily.
- Maintain consistent alignment with text.
- Use icons sparingly in dense layouts.

---

## 13. Motion

Motion should feel subtle, elegant, and purposeful. Use Framer Motion for transitions and interactive feedback.

### Page transitions
- Fade and slight upward movement for page entry
- Duration: 180ms to 280ms
- Ease: cubic-bezier(0.2, 0.8, 0.2, 1)

### Hover effects
- Slight lift or color shift
- Duration: 150ms to 200ms
- Keep interactions lightweight and polished

### Button animations
- Subtle scale or translate on press
- Avoid exaggerated motion
- Maintain responsive, snappy feedback

### Card animations
- Gentle fade-in and slight upward motion on reveal
- Use staggered motion for lists or grids when appropriate
- Keep motion accessible and not excessive

---

## 14. Responsive Design

The experience should feel polished on desktop, tablet, and mobile.

### Breakpoints
- Mobile: under 768px
- Tablet: 768px to 1023px
- Desktop: 1024px and above

### Responsive spacing
- Mobile: use tighter spacing and simplified layouts
- Tablet: increase section spacing slightly
- Desktop: use full-width layouts with more visual breathing room

### Responsive behavior guidelines
- Prioritize content hierarchy on small screens.
- Collapse secondary navigation into mobile-friendly patterns.
- Ensure touch targets remain large enough on mobile.
- Maintain consistent card padding and readable typography across screen sizes.

---

## 15. Accessibility

Accessibility is a core product requirement, not an afterthought.

### Contrast guidelines
- Ensure all text meets WCAG AA contrast levels.
- Primary text should be dark and high contrast.
- Avoid low-contrast gray text on light backgrounds.

### Focus states
- Every interactive element should have a visible focus ring.
- Focus rings should be clear, consistent, and aligned with the product color system.

### Keyboard navigation
- All interactive elements must be reachable by keyboard.
- Support logical tab order and visible focus states.
- Avoid interactions that rely on hover alone.

### Additional guidance
- Use descriptive labels for form fields and buttons.
- Provide clear error messaging.
- Ensure modals and overlays trap focus appropriately.

---

## 16. Reusable Components

The following components should exist as reusable building blocks for the product.

### Core UI components
- Navbar
- Sidebar
- Hero
- Feature Card
- Stats Card
- Interview Card
- Feedback Card
- Progress Ring
- Upload Card
- Modal
- Toast
- Empty State
- Skeleton Loader
- Charts
- Footer

### Additional recommended components
- Badge
- Avatar
- Section Header
- Page Header
- Metric Pill
- Tabs
- Tooltip
- Alert Banner
- Loading State
- Divider
- Table
- Select
- Tag

### Component composition rules
- Components should be composable, reusable, and semantically named.
- Prefer variant-based patterns over one-off implementations.
- Use the same spacing, color, and motion tokens everywhere.
- Keep component APIs simple and predictable.

---

## 17. Implementation Guidance for GitHub Copilot

When generating UI for Unmute, Copilot should follow these rules:

1. Use the defined color tokens and avoid introducing new colors.
2. Prefer the existing teal/emerald palette for emphasis and charts.
3. Use Geist for all text.
4. Build layouts using the 4px spacing system.
5. Default to rounded corners of 10px to 16px.
6. Use soft, minimal shadows and restrained motion.
7. Favor clean card-based layouts over dense clutter.
8. Ensure every interactive element has a visible focus state.
9. Keep components accessible, readable, and calm.
10. Treat this document as the default source of truth for all UI creation.

---

## Summary

Unmute should feel like a premium AI coaching experience: polished, modern, calm, and deeply supportive. Every color, spacing choice, interaction, and component should reinforce that feeling.

The design language should stay restrained, consistent, and friendly—never noisy, overly playful, or visually chaotic.
