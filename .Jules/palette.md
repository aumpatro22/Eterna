## 2024-06-26 - Adding Accessible Form Labels and Required Indicators
**Learning:** Explicitly linking form labels (`htmlFor`) to inputs (`id`) is a critical accessibility requirement. Visual required indicators (`<span className="text-marker">*</span>`) should be accompanied by `aria-required="true"` to ensure screen readers correctly convey the mandatory nature of fields.
**Action:** Always ensure `id` and `htmlFor` attributes are correctly matched on forms, and that visual indicators of required fields have programmatic equivalents (`aria-required`).

## 2024-07-26 - Adding Accessible Menu and Toggle States
**Learning:** Expanding menus and toggle buttons need specific ARIA attributes (`aria-expanded`, `aria-controls`, and `aria-pressed`) to be properly understood by screen reader users. Visual-only cues (like text changing from 'Sketch Mode' to 'Drawing Active') are not sufficient.
**Action:** Always ensure stateful toggle buttons use `aria-pressed`, and expandable menus use `aria-expanded` tied to the container's `id` via `aria-controls`.
