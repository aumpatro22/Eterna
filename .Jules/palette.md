## 2024-06-26 - Adding Accessible Form Labels and Required Indicators
**Learning:** Explicitly linking form labels (`htmlFor`) to inputs (`id`) is a critical accessibility requirement. Visual required indicators (`<span className="text-marker">*</span>`) should be accompanied by `aria-required="true"` to ensure screen readers correctly convey the mandatory nature of fields.
**Action:** Always ensure `id` and `htmlFor` attributes are correctly matched on forms, and that visual indicators of required fields have programmatic equivalents (`aria-required`).

## 2026-07-07 - Accessibility of Color Selection in DoodleOverlay
**Learning:** Found that custom color selection buttons built with simple `div` or `button` tags and CSS classes for colors lack descriptive names for screen readers, acting merely as icon-only buttons.
**Action:** Always wrap a list of related selection items (like colors) in a `role="group"` with an `aria-label`, and ensure each interactive item has an `aria-label` describing it (e.g., "Red Marker") along with an `aria-pressed` state to indicate the current selection programmatically.
