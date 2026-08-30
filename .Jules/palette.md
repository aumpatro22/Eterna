## 2024-06-26 - Adding Accessible Form Labels and Required Indicators
**Learning:** Explicitly linking form labels (`htmlFor`) to inputs (`id`) is a critical accessibility requirement. Visual required indicators (`<span className="text-marker">*</span>`) should be accompanied by `aria-required="true"` to ensure screen readers correctly convey the mandatory nature of fields.
**Action:** Always ensure `id` and `htmlFor` attributes are correctly matched on forms, and that visual indicators of required fields have programmatic equivalents (`aria-required`).
## 2024-08-30 - Accessible Color Picker
**Learning:** Purely visual toggle buttons (like color selectors) require aria-label for context and aria-pressed to communicate state to screen readers.
**Action:** Always verify stateful toggle buttons have aria-pressed, and icon-only/color-only buttons have explicit aria-label attributes.
