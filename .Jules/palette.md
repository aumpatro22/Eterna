## 2024-06-26 - Adding Accessible Form Labels and Required Indicators
**Learning:** Explicitly linking form labels (`htmlFor`) to inputs (`id`) is a critical accessibility requirement. Visual required indicators (`<span className="text-marker">*</span>`) should be accompanied by `aria-required="true"` to ensure screen readers correctly convey the mandatory nature of fields.
**Action:** Always ensure `id` and `htmlFor` attributes are correctly matched on forms, and that visual indicators of required fields have programmatic equivalents (`aria-required`).

## 2026-08-27 - ARIA State Attributes for UI Toggles
**Learning:** Toggle buttons with active/inactive states (like Sketch Mode) and expandable menus (like the mobile navbar) must programmatically communicate their state using ARIA attributes (`aria-pressed`, `aria-expanded`, `aria-controls`). This ensures users utilizing assistive technology receive correct and updated state information.
**Action:** Always include `aria-pressed` for two-state buttons, and pair `aria-expanded` with `aria-controls` for elements that hide/reveal content.
