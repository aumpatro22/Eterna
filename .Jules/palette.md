## 2024-06-26 - Adding Accessible Form Labels and Required Indicators
**Learning:** Explicitly linking form labels (`htmlFor`) to inputs (`id`) is a critical accessibility requirement. Visual required indicators (`<span className="text-marker">*</span>`) should be accompanied by `aria-required="true"` to ensure screen readers correctly convey the mandatory nature of fields.
**Action:** Always ensure `id` and `htmlFor` attributes are correctly matched on forms, and that visual indicators of required fields have programmatic equivalents (`aria-required`).

## 2026-08-31 - Mobile Menu and Toggle Button Accessibility
**Learning:** Expanding menus and toggle buttons need specific ARIA states. Expandable mobile menus must use `aria-expanded` and `aria-controls` to let screen readers know they exist and their current state. Stateful toggle buttons like Sketch Mode must use `aria-pressed` to reflect whether the feature is active.
**Action:** Consistently apply `aria-expanded` and `aria-controls` on mobile menu toggles, and use `aria-pressed` on any buttons that act as toggles for a specific state.
