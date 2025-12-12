---
name: ui-design-patterns
description: Pico CSS patterns for Python stack apps, semantic HTML, dark mode templates. Use when creating HTML templates, styling with Pico CSS, or building Python web UIs.
allowed-tools: Read, Grep, Glob
---

# UI Design Standards (Python Stack)

Pico CSS in dark mode. Semantic HTML.

## When to Use This Skill

- Creating Jinja2 templates for FastAPI
- Styling with Pico CSS
- Building forms, tables, or cards
- Working with dark mode themes

## Base Template

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
  <title>{% block title %}App{% endblock %}</title>
</head>
<body>
  <nav class="container">
    <ul><li><strong>App Name</strong></li></ul>
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
  <main class="container">
    {% block content %}{% endblock %}
  </main>
</body>
</html>
```

## Components

```html
<!-- Card -->
<article>
  <header>Title</header>
  <p>Content</p>
  <footer><button>Action</button></footer>
</article>

<!-- Form -->
<form method="post">
  <label>Name <input type="text" name="name" required></label>
  <button type="submit">Save</button>
</form>

<!-- Table -->
<table>
  <thead><tr><th>Name</th><th>Status</th></tr></thead>
  <tbody><tr><td>Item</td><td>Active</td></tr></tbody>
</table>

<!-- Status -->
<ins>Approved</ins>  <!-- green -->
<del>Rejected</del>  <!-- red -->
<mark>Pending</mark> <!-- yellow -->
```

## Verify Existing Templates

```bash
# Find template files
find templates/ -name "*.html"

# Find Pico CSS usage
grep -r "container" templates/ --include="*.html"

# Find forms
grep -r "<form" templates/ --include="*.html"
```

## Do Not

- No other CSS frameworks
- No custom CSS unless necessary
- No JavaScript frameworks
