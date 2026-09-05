## 2024-06-26 - Adding Accessible Form Labels and Required Indicators
**Learning:** Explicitly linking form labels (`htmlFor`) to inputs (`id`) is a critical accessibility requirement. Visual required indicators (`<span className="text-marker">*</span>`) should be accompanied by `aria-required="true"` to ensure screen readers correctly convey the mandatory nature of fields.
**Action:** Always ensure `id` and `htmlFor` attributes are correctly matched on forms, and that visual indicators of required fields have programmatic equivalents (`aria-required`).
## 2024-05-24 - Accessibility improvements for Mobile Menu
**Learning:** Adding semantic attributes like `aria-expanded` and `aria-controls` to mobile menus is essential for screen reader users to understand navigation state and context. Likewise, stateful toggles should utilize `aria-pressed` for clear feedback.
**Action:** Always verify that custom expandable menus and state toggles use the appropriate ARIA attributes for semantic richness.
