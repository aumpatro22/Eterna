## 2024-06-26 - Adding Accessible Form Labels and Required Indicators
**Learning:** Explicitly linking form labels (`htmlFor`) to inputs (`id`) is a critical accessibility requirement. Visual required indicators (`<span className="text-marker">*</span>`) should be accompanied by `aria-required="true"` to ensure screen readers correctly convey the mandatory nature of fields.
**Action:** Always ensure `id` and `htmlFor` attributes are correctly matched on forms, and that visual indicators of required fields have programmatic equivalents (`aria-required`).

## 2026-08-26 - Accessible Stateful Toggle Buttons and Expandable Elements
**Learning:** Stateful toggle buttons (like sketch mode toggles) lack intrinsic context for screen readers when their visual styling changes to reflect state. They require `aria-pressed` to announce their active/inactive status. Similarly, toggle buttons for expanding menus need `aria-expanded` and clear descriptive labels (`aria-label`) so users relying on assistive tech know the menu's state and purpose.
**Action:** Consistently add `aria-pressed` to buttons that toggle modes/states, and `aria-expanded` plus `aria-label` to buttons that open/close navigation menus.
