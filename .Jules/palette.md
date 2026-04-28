## 2024-05-18 - AI Explanation Box Accessibility
**Learning:** React boxes that populate asynchronously with AI text explanation (like `AIExplanationPanel.tsx`) need explicit ARIA tags so screen readers announce the newly added content. Without them, users who rely on screen readers won't know the AI completed its response.
**Action:** Add `aria-live="polite"` and `aria-atomic="true"` to dynamic text container boxes displaying asynchronous AI results.
