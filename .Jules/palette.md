## 2024-06-26 - Adding Accessible Form Labels and Required Indicators
**Learning:** Explicitly linking form labels (`htmlFor`) to inputs (`id`) is a critical accessibility requirement. Visual required indicators (`<span className="text-marker">*</span>`) should be accompanied by `aria-required="true"` to ensure screen readers correctly convey the mandatory nature of fields.
**Action:** Always ensure `id` and `htmlFor` attributes are correctly matched on forms, and that visual indicators of required fields have programmatic equivalents (`aria-required`).

## 2024-11-20 - Adding Accessibility Attributes to Mobile Menus and Toggles
**Learning:** For a fully accessible navigation, expandable mobile menus require a button with `aria-expanded` reflecting the menu's state and `aria-controls` referencing the menu's ID. In addition, stateful toggle buttons (like a sketch mode toggle) need an `aria-pressed` attribute, which programmatically communicates the active state to screen reader users much better than just text or style changes.
**Action:** When implementing or updating navigation menus and toggle buttons in the future, always include `aria-expanded`/`aria-controls` and `aria-pressed` respectively.
