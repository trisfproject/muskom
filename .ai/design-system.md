---
Title: Design System
Purpose: The MUSKOM UI Constitution — colors, typography, spacing, and interaction rules.
Owner: Product Owner
Last Updated: 2026-08-01
Related Documents: .ai/README.md, .ai/business-context.md
---


# ACCESSIBILITY

While specific WCAG guidelines are not strictly enumerated, accessibility is driven by our core principle of **Readability**.

- Text contrast must remain high.
- Interactive elements must be clearly distinguishable.
- Do not sacrifice readability for aesthetics under any circumstance.
- Forms and inputs must be clear, well-spaced, and easy to navigate.


# COLOR USAGE

## Primary Brand Color
- **Azure Blue**: The ONE primary brand color. Used for CTAs, active states, and brand identity.

## Accent Colors
Accent colors support hierarchy only. They must **never dominate the interface**.
- **Sky Blue**: Secondary accent
- **Amber**: Highlight / Warning
- **Emerald**: Success

## Semantic Colors
Semantic colors are allowed only for status and must never replace the primary brand.
- **Information**: Blue
- **Success**: Emerald
- **Warning**: Amber
- **Agenda**: Violet
- **Danger**: Rose

## Backgrounds
- Avoid flat white. Use subtle layers.
- **Hero**: Soft gradient.
- **Sections**: Very light tonal changes.
- **Cards**: Soft white with subtle borders.
- **Admin**: Light neutral backgrounds.
Everything should feel airy.


# MUSKOM DESIGN CONSTITUTION

## MISSION
MUSKOM is not a dashboard.
MUSKOM is not an admin template.
MUSKOM is a premium public platform for community governance.
Every interface must communicate: Trust, Clarity, Speed, Professionalism, and Energy.
The product should feel modern without sacrificing readability.

## DESIGN PRINCIPLE
Light Theme is the PRIMARY experience.
Dark Theme is secondary.
Every component must be designed in Light Theme first.

## VISUAL PERSONALITY
Bright, Modern, Energetic, Premium, Minimal, Readable, Friendly, Official.

## SUCCESS CRITERIA
Users should think: "This portal is professional.", "This portal is fast.", "This portal is easy to use.", "This portal feels trustworthy."
Not: "This portal has beautiful gradients."
Design exists to support the product, not to attract attention.


# DESIGN SYSTEM COMPONENTS

Landing, Registration, Candidate, Attendance, Voting, Result, and Admin must all use the same design language. No page should look like a different product.

## Shared Components
- Buttons
- Cards
- Inputs
- Badges
- Tables
- Dialogs
- Dropdowns
- Pagination
- Alerts
- Toasts

## Engineering Rules for UI
- Never introduce a new visual style if an existing component already solves the problem.
- Extend the Design System instead.
- Avoid duplicated UI.
- The Admin Portal must feel as polished as the public website. Avoid traditional enterprise dashboards (use cards, whitespace, keep tables clean).


# MOTION & ELEVATION

## Elevation
- Use subtle shadows.
- Avoid heavy shadows.
- Avoid thick borders.
Premium interfaces rely on depth, not decoration.

## Interaction & Animation
- **Hover**: Lift slightly, increase shadow subtly.
- **Duration**: 200ms
- Transitions must feel smooth.

## Performance Constraints
- Fast first render.
- Minimal layout shift.
- Minimal animation.
- Responsive interactions.


# SPACING

Whitespace is a fundamental part of the design.

- Do not compress layouts.
- Use generous spacing.
- Avoid crowded interfaces.

Every component and section must have room to breathe, reinforcing the premium and readable nature of the product.


# TYPOGRAPHY

## Core Principles
- Large headings.
- Comfortable body text.
- Consistent spacing.
- Readable line height.
- No decorative fonts.

## Readability (Highest Priority)
- Every page must remain easy to read.
- Avoid low contrast text.
- Avoid tiny fonts.
- Avoid decorative backgrounds behind paragraphs.

## Hierarchy
Text hierarchy must always be obvious:
- **Heading**: Strong
- **Body**: Comfortable
- **Caption**: Still readable

Never sacrifice readability for aesthetics.
