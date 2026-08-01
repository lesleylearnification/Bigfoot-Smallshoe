# Build 6 Module 9 QA and Accessibility Notes

## Accessibility implemented

- Skip navigation link
- Keyboard-visible focus states
- Escape-to-close behavior for panels
- Focus management after screen changes
- Screen-reader announcements for screen changes, decisions, research, and reflection
- Larger-text option
- Higher-contrast option
- Sound and motion controls
- Reduced-motion media query
- Forced-colors support
- Minimum 44px interaction targets
- Responsive layouts down to 320px
- Semantic headings and landmarks

## Automated checks

Run:

```bash
npm test
```

Checks include:

- Required screen and system files
- Accessibility markup
- Scenario count and choice structure
- Six-dimensional score arrays
- Persistence API exports

## Performance

- Static site with no framework or external runtime dependencies
- JPEGs optimized and saved progressively
- Non-critical images use lazy loading and async decoding
- Original audio assets are lightweight mono WAV files
- Works on GitHub Pages with no build step

## Manual testing checklist

1. Complete a full five-scenario expedition using only the keyboard.
2. Open and close every panel with Escape.
3. Test at 320px, 390px, 768px, 1024px, and 1440px widths.
4. Test sound off, motion off, large text, and high contrast.
5. Refresh during gameplay and verify that progress persists.
6. Complete five rounds and verify all ending paths.
7. Open external research links and confirm they use a new tab.
