## 2024-06-26 - Adding Accessible Form Labels and Required Indicators
**Learning:** Explicitly linking form labels (`htmlFor`) to inputs (`id`) is a critical accessibility requirement. Visual required indicators (`<span className="text-marker">*</span>`) should be accompanied by `aria-required="true"` to ensure screen readers correctly convey the mandatory nature of fields.
**Action:** Always ensure `id` and `htmlFor` attributes are correctly matched on forms, and that visual indicators of required fields have programmatic equivalents (`aria-required`).
## 2024-05-15 - Add Missing ARIA Attributes to Navbar Toggles
**Learning:** React toggles like the Sketch Mode button and Mobile Menu button were visually stateful but lacked programmatic state attributes. Using `aria-expanded`, `aria-controls`, and `aria-pressed` makes these custom toggle controls properly perceivable by screen readers.
**Action:** When adding or modifying custom toggle controls (like menus or mode switches), always ensure programmatic state is reflected with `aria-expanded` or `aria-pressed`.
