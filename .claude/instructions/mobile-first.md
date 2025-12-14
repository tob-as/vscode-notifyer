# Mobile First Design

## Principle

Design for mobile screens first, then enhance for larger screens.

## Why Mobile First?

1. **Majority of users**: Most traffic comes from mobile devices
2. **Constraints breed clarity**: Limited space forces focus on essentials
3. **Progressive enhancement**: Easier to add than remove features
4. **Performance**: Mobile-first often means faster, lighter pages

## CSS Approach

### Tailwind (Recommended)

```tsx
// Mobile first - base styles apply to mobile
// Then add responsive prefixes for larger screens
<div className="
  flex flex-col        // Mobile: stack vertically
  md:flex-row          // Tablet+: horizontal layout
  p-4                  // Mobile: padding
  md:p-6               // Tablet+: more padding
  lg:p-8               // Desktop: even more
">
```

### Breakpoints

| Prefix | Min Width | Target |
|--------|-----------|--------|
| (none) | 0px | Mobile |
| `sm:` | 640px | Large phones |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large screens |

## UI Guidelines

### Touch Targets

- Minimum 44x44px for interactive elements
- Add padding rather than making text larger
- Leave space between clickable items

### Typography

```tsx
// Mobile-optimized text sizes
<h1 className="text-2xl md:text-3xl lg:text-4xl">
<p className="text-base md:text-lg">
```

### Navigation

- Use hamburger menu on mobile
- Full nav bar on desktop
- Bottom navigation for primary actions (mobile apps)

```tsx
// Mobile: hamburger, Desktop: full nav
<nav className="hidden md:flex">Full nav</nav>
<button className="md:hidden">☰</button>
```

### Forms

- Full-width inputs on mobile
- Use appropriate input types (`tel`, `email`, `number`)
- Large touch targets for buttons

```tsx
<input
  type="email"
  className="w-full md:w-auto"
  inputMode="email"
/>
<button className="w-full md:w-auto py-3">
```

### Images

- Responsive images with srcset
- Lazy loading for below-fold images
- Aspect ratio containers

```tsx
<img
  srcSet="/img-sm.jpg 640w, /img-lg.jpg 1280w"
  sizes="(max-width: 640px) 100vw, 50vw"
  loading="lazy"
  className="w-full aspect-video object-cover"
/>
```

## Testing Requirements

Every feature MUST be tested on:
- [ ] Mobile viewport (375px width)
- [ ] Tablet viewport (768px width)
- [ ] Desktop viewport (1280px width)

Use Playwright with mobile projects for automated testing.

## Do Not

- Design for desktop first and "make it responsive later"
- Use hover-only interactions (no hover on touch)
- Make text smaller than 16px on mobile
- Use fixed widths that overflow mobile screens
- Forget to test actual touch interactions
