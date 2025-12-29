# BuildCalc Redesign Notes

These notes summarize the visual direction that guides the current redesign. The goal is a clean, premium look with energetic accents that highlight key actions and results without sacrificing readability.

## Palette & Visual Language

- **Base**: Warm neutral background (`#F8F5F2`) paired with deep charcoal text (`#11131B`) for strong contrast.
- **Primary accent**: Vivid tangerine (`#FF7A18`) used for CTAs, result highlights, and key chips. Hover darkens toward `#E76508` to maintain WCAG AA contrast.
- **Secondary accent**: Electric violet (`#6F5BFF`) introduces modern flair across filters, metrics, and badges.
- **Support colors**: Emerald (`#00B894`) for success states, coral red (`#FF4D4D`) for errors, slate blue (`#1F2A44`) for surfaces, and mist gray (`#D8DEE9`) for dividers/skeletons.
- **Gradients & glows**: Soft radial glows (orange → transparent) emphasize hero sections, while subtle linear gradients on cards reinforce depth.

## Typography & Spacing

- **Headings**: Use `font-semibold` to `font-extrabold`, tighter tracking on display sizes, and increased leading on body copy for readability.
- **Scale**: Base text 16px, large display 48–56px, supporting hierarchy at 20/24/32px.
- **Spacing**: Generous 24–32px padding on surface panels with `1.25rem` vertical rhythm for form fields.

## Components & States

- **Inputs**: Pill-shaped containers with integrated unit labels, 1.5px borders, and focus glow (`box-shadow` + ring).
- **Cards**: Layered backgrounds (muted base + gradient overlay) with micro-interactions: lift on hover, 200ms transition, and icon shift.
- **Chips/filters**: Rounded capsules with active/focus states, using primary accent fill and soft drop shadows.
- **Badges**: Variants for `Популярно`, `Новый`, `Точный`, `Быстрый`, combining accent colors with uppercase microcopy.
- **Result card**: Sticky column on desktop containing headline metric, breakdown rows, packaging summary, copy/share actions, and mode toggle tabs.

## Interaction Principles

1. **Motion as feedback**: Short (150–250ms) transitions on hover/focus, plus staggered card reveals using CSS keyframes.
2. **Visibility of state**: Clear empty/error/loading states with friendly messaging and illustration glyphs.
3. **Favorites**: Optimistic UI—favoriting a calculator updates instantly with `localStorage` persistence and toast confirmation.
4. **Keyboard & screen reader support**: Focus outlines with 2px ring, aria labels for favorite toggles, and semantic grouping of filters.

## Accessibility Checklist

- Maintain minimum 4.5:1 contrast on text/background combinations.
- Provide `aria-live` updates for result recalculations when possible.
- Ensure tooltips are keyboard accessible and dismissible.
- Offer skeletons and descriptive empty states to reduce perceived latency.

## Implementation Reminders

- Store all new tokens as CSS variables in `globals.css` and reference them through Tailwind custom properties.
- Keep interactive logic (favorites, filters, presets) in dedicated hooks/components inside `src/components` to avoid bloated pages.
- Prefer CSS transitions and keyframes; introduce `framer-motion` only if native options fall short.
- Document any follow-up experiments directly in this file for future designers.
