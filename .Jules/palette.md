## 2024-06-26 - Adding Accessible Form Labels and Required Indicators
**Learning:** Explicitly linking form labels (`htmlFor`) to inputs (`id`) is a critical accessibility requirement. Visual required indicators (`<span className="text-marker">*</span>`) should be accompanied by `aria-required="true"` to ensure screen readers correctly convey the mandatory nature of fields.
**Action:** Always ensure `id` and `htmlFor` attributes are correctly matched on forms, and that visual indicators of required fields have programmatic equivalents (`aria-required`).
## 2026-07-05 - Adding Accessible Context to State-Based Visual Controls
**Learning:** Screen readers often miss the purpose of icon-only elements used for color picking or setting drawing modes, as well as their active/selected states, which are usually only indicated visually via CSS.
**Action:** Always apply `aria-label` to describe the function (e.g., 'Select blue brush color') and `aria-pressed` to reflect the active selection state (e.g., `aria-pressed={color === '#2d5da1'}`) for custom UI toggles and color pickers.
