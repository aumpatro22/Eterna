## 2024-06-26 - Adding Accessible Form Labels and Required Indicators
**Learning:** Explicitly linking form labels (`htmlFor`) to inputs (`id`) is a critical accessibility requirement. Visual required indicators (`<span className="text-marker">*</span>`) should be accompanied by `aria-required="true"` to ensure screen readers correctly convey the mandatory nature of fields.
**Action:** Always ensure `id` and `htmlFor` attributes are correctly matched on forms, and that visual indicators of required fields have programmatic equivalents (`aria-required`).

## 2024-06-28 - Custom Checkbox Accessibility
**Learning:** Custom checkboxes styled with `className="hidden"` on the `<input>` element are completely removed from the accessibility tree, preventing keyboard focus and screen reader detection.
**Action:** Always use `sr-only` instead of `hidden` for inputs hidden behind custom UI. Use tailwind's `peer` class on the input and `peer-focus-visible` on the custom UI element to proxy focus states, or wrap them in a label with `focus-within`.
