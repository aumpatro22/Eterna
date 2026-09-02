## 2024-06-26 - Adding Accessible Form Labels and Required Indicators
**Learning:** Explicitly linking form labels (`htmlFor`) to inputs (`id`) is a critical accessibility requirement. Visual required indicators (`<span className="text-marker">*</span>`) should be accompanied by `aria-required="true"` to ensure screen readers correctly convey the mandatory nature of fields.
**Action:** Always ensure `id` and `htmlFor` attributes are correctly matched on forms, and that visual indicators of required fields have programmatic equivalents (`aria-required`).
## 2024-06-27 - Add aria attributes to stateful buttons
**Learning:** Stateful buttons like toggle switches need `aria-pressed` to inform screen readers of their state, and expandable elements need `aria-expanded` and `aria-controls`.
**Action:** Always check interactive toggle elements and dropdown menus for these ARIA attributes to ensure full accessibility.
