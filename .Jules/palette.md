## 2024-06-26 - Adding Accessible Form Labels and Required Indicators
**Learning:** Explicitly linking form labels (`htmlFor`) to inputs (`id`) is a critical accessibility requirement. Visual required indicators (`<span className="text-marker">*</span>`) should be accompanied by `aria-required="true"` to ensure screen readers correctly convey the mandatory nature of fields.
**Action:** Always ensure `id` and `htmlFor` attributes are correctly matched on forms, and that visual indicators of required fields have programmatic equivalents (`aria-required`).

## 2023-10-24 - Accessibility for Icon-only and Stateful Buttons
**Learning:** Icon-only buttons (like color selectors) require `aria-label` attributes to be perceivable by screen readers. Furthermore, stateful toggle buttons (like those indicating color or thickness selection) must use the `aria-pressed` attribute to programmatically communicate their active state, rather than relying solely on visual cues like borders or background colors.
**Action:** Always ensure that any button without explicit text content has an `aria-label`. For buttons that represent a selected/unselected state in a group, implement the `aria-pressed` attribute, binding its value to the component's state.
