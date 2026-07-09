## 2024-06-26 - Adding Accessible Form Labels and Required Indicators
**Learning:** Explicitly linking form labels (`htmlFor`) to inputs (`id`) is a critical accessibility requirement. Visual required indicators (`<span className="text-marker">*</span>`) should be accompanied by `aria-required="true"` to ensure screen readers correctly convey the mandatory nature of fields.
**Action:** Always ensure `id` and `htmlFor` attributes are correctly matched on forms, and that visual indicators of required fields have programmatic equivalents (`aria-required`).
## 2026-07-09 - Accessible Navbar Toggles
**Learning:** Collapsible menus and toggle buttons (like the Sketch Mode toggler) present a significant accessibility barrier if they don't programmatically expose their state.
**Action:** Always ensure toggle buttons use `aria-pressed` to reflect their active state, and collapsible menus use `aria-expanded` and `aria-controls` properly linked by ID.
