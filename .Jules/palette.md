## 2024-05-24 - Accessibility Enhancements in Navbar

**Learning:** When dealing with custom toggle buttons (like "Sketch Mode") and dynamic menus in React applications, developers frequently forget to communicate state changes to screen readers using ARIA attributes like `aria-pressed`, `aria-expanded`, and `aria-controls`.
**Action:** Always verify that interactive custom components have corresponding ARIA states that reflect their visual and functional state. In this app, checking the Navbar components is a great place to start looking for a11y quick wins.