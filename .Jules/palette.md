## 2024-06-26 - Adding Accessible Form Labels and Required Indicators
**Learning:** Explicitly linking form labels (`htmlFor`) to inputs (`id`) is a critical accessibility requirement. Visual required indicators (`<span className="text-marker">*</span>`) should be accompanied by `aria-required="true"` to ensure screen readers correctly convey the mandatory nature of fields.
**Action:** Always ensure `id` and `htmlFor` attributes are correctly matched on forms, and that visual indicators of required fields have programmatic equivalents (`aria-required`).

## 2024-07-03 - Expanding Mobile Navigation Accessibility
**Learning:** Toggle buttons that open or close components like mobile navigation menus must communicate their state using ARIA attributes (`aria-expanded`, `aria-controls`, `aria-label`). Without these, screen reader users only hear "button" and "X" or "Menu" but do not understand the state of the component they control.
**Action:** When implementing any toggle interaction that reveals hidden content, attach `aria-expanded` and `aria-controls` to the triggering button, and pair it with a corresponding `id` on the target container.
