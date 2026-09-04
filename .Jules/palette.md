## 2024-06-26 - Adding Accessible Form Labels and Required Indicators
**Learning:** Explicitly linking form labels (`htmlFor`) to inputs (`id`) is a critical accessibility requirement. Visual required indicators (`<span className="text-marker">*</span>`) should be accompanied by `aria-required="true"` to ensure screen readers correctly convey the mandatory nature of fields.
**Action:** Always ensure `id` and `htmlFor` attributes are correctly matched on forms, and that visual indicators of required fields have programmatic equivalents (`aria-required`).

## 2026-09-04 - Adding Accessible Toggle States to Navbar
**Learning:** For mobile menus and toggle buttons (like sketch mode), standard UI patterns require programmatic state tracking for screen readers. Using `aria-expanded` on menus and `aria-pressed` on toggle buttons ensures users utilizing assistive technologies understand the current active state.
**Action:** Always verify that interactive elements controlling layout or application states include appropriate ARIA state attributes (`aria-expanded`, `aria-pressed`, `aria-controls`) correctly linked to their respective DOM elements.
