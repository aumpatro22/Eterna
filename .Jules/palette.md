## 2024-05-18 - Added ARIA Label to Unpin Note Button in DoodleCorkboard
**Learning:** Found a missing `aria-label` on an icon-only delete/unpin button in the `DoodleCorkboard.jsx` component. Although the button had a `title` attribute for visual hover text, screen readers still benefit from explicit `aria-label` attributes on semantic `<button>` elements with single character or icon content.
**Action:** Always verify that buttons containing only icons or non-descriptive characters (like 'x') have an explicit `aria-label` set, even if a `title` attribute is present.
