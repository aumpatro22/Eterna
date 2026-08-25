## 2024-06-26 - Adding Accessible Form Labels and Required Indicators
**Learning:** Explicitly linking form labels (`htmlFor`) to inputs (`id`) is a critical accessibility requirement. Visual required indicators (`<span className="text-marker">*</span>`) should be accompanied by `aria-required="true"` to ensure screen readers correctly convey the mandatory nature of fields.
**Action:** Always ensure `id` and `htmlFor` attributes are correctly matched on forms, and that visual indicators of required fields have programmatic equivalents (`aria-required`).
## 2026-08-25 - ARIA attributes for custom toggles
**Learning:** Custom UI toggles (like Sketch Mode and Mobile Menus) often miss explicit ARIA state declarations. `aria-pressed` is essential for standalone toggle buttons, while `aria-expanded` alongside `aria-controls` maps properly for menu disclosures to communicate their current state to screen readers.
**Action:** Always ensure that interactive UI elements reflecting a toggle state explicitly include the appropriate ARIA attributes (`aria-pressed` or `aria-expanded`) when adding new features or modifying existing layouts.
