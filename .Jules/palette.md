## 2024-06-26 - Adding Accessible Form Labels and Required Indicators
**Learning:** Explicitly linking form labels (`htmlFor`) to inputs (`id`) is a critical accessibility requirement. Visual required indicators (`<span className="text-marker">*</span>`) should be accompanied by `aria-required="true"` to ensure screen readers correctly convey the mandatory nature of fields.
**Action:** Always ensure `id` and `htmlFor` attributes are correctly matched on forms, and that visual indicators of required fields have programmatic equivalents (`aria-required`).
## 2026-07-08 - [Navbar Accessibility]
**Learning:** [UX/a11y insight] Mobile menus and toggle buttons in React require careful application of ARIA attributes (, , ) to effectively communicate their state to assistive technologies.
**Action:** [How to apply next time] Always inspect stateful interactive elements in custom React components to ensure they properly convey their state programmatically.
## 2026-07-08 - [Navbar Accessibility]
**Learning:** [UX/a11y insight] Mobile menus and toggle buttons in React require careful application of ARIA attributes (aria-pressed, aria-expanded, aria-controls) to effectively communicate their state to assistive technologies.
**Action:** [How to apply next time] Always inspect stateful interactive elements in custom React components to ensure they properly convey their state programmatically.
