## 2024-06-26 - Adding Accessible Form Labels and Required Indicators
**Learning:** Explicitly linking form labels (`htmlFor`) to inputs (`id`) is a critical accessibility requirement. Visual required indicators (`<span className="text-marker">*</span>`) should be accompanied by `aria-required="true"` to ensure screen readers correctly convey the mandatory nature of fields.
**Action:** Always ensure `id` and `htmlFor` attributes are correctly matched on forms, and that visual indicators of required fields have programmatic equivalents (`aria-required`).
## 2024-05-14 - Navbar Accessibility State Management
**Learning:** Found that custom interactive toggle elements (like mobile menu buttons and sketch mode togglers) often lack semantic state information for screen readers in this application's components.
**Action:** Always ensure stateful toggle buttons use the `aria-pressed` attribute, and expandable menus/elements use `aria-expanded` and `aria-controls` to reflect their active state programmatically.
