## 2024-05-24 - Accessibility for Hover-to-Reveal Overlays
**Learning:** Hover-to-reveal overlays that translate off-screen (`translateY`) remain in the accessibility tree. Keyboard users tabbing into the hidden elements won't trigger standard `onMouseEnter` events, leaving them navigating invisible controls.
**Action:** Always add `onFocusCapture` and `onBlurCapture` (with `contains` checks on `relatedTarget`) to the parent container of hover-to-reveal overlays so they automatically slide into view when tabbed into.
