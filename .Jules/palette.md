## 2024-06-26 - Adding Accessible Form Labels and Required Indicators
**Learning:** Explicitly linking form labels (`htmlFor`) to inputs (`id`) is a critical accessibility requirement. Visual required indicators (`<span className="text-marker">*</span>`) should be accompanied by `aria-required="true"` to ensure screen readers correctly convey the mandatory nature of fields.
**Action:** Always ensure `id` and `htmlFor` attributes are correctly matched on forms, and that visual indicators of required fields have programmatic equivalents (`aria-required`).

## 2024-08-29 - Accessible Stateful and Expandable Buttons
**Learning:** Stateful toggle buttons (like sketch mode) require the `aria-pressed` attribute to reflect their active state programmatically for screen readers. Expandable menus/elements require `aria-expanded` on the toggle button and `aria-controls` pointing to the `id` of the menu container.
**Action:** Always verify that interactive components with toggled states correctly convey their current status through `aria-pressed` or `aria-expanded` and link related elements using `aria-controls`.