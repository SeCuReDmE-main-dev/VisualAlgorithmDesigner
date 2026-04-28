## 2024-04-28 - Avoid aria-hidden on Stateful Elements
**Learning:** Adding `aria-hidden="true"` to visual progress indicators (like dots in a tutorial) that use `aria-current` to denote active state makes them completely invisible to screen readers, defeating the purpose of the state attribute.
**Action:** Instead of hiding them, enhance them for screen readers by adding `aria-label`, `role="button"`, and `tabIndex={0}` to provide context while keeping them semantic.

## 2024-04-28 - Safely Enhancing Form Accessibility
**Learning:** While explicitly linking inputs and labels via `htmlFor` and `id` is a best practice, extracting inputs from within their wrapper `<label>` tags can break existing CSS layouts (e.g., flexbox styling that relies on nesting).
**Action:** Always add the explicit `htmlFor` and `id` attributes, but keep the `<input>` nested inside the `<label>` wrapper to preserve visual styling.
