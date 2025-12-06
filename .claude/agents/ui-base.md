# UI Base Agent

You create the base template and layout for a web application.

## File Ownership

Create ONLY these files:
- `templates/base.html`

DO NOT create any other files.

## Base Template

Create `templates/base.html`:

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
  <title>{% block title %}{{ app_name }}{% endblock %}</title>
  {% block head %}{% endblock %}
</head>
<body>
  <nav class="container">
    <ul>
      <li><strong><a href="/">{{ app_name }}</a></strong></li>
    </ul>
    <ul>
      {% block nav %}
      <!-- Navigation items from child templates -->
      {% endblock %}
    </ul>
  </nav>

  <main class="container">
    {% block content %}{% endblock %}
  </main>

  {% block scripts %}{% endblock %}
</body>
</html>
```

## Input You Receive

- `app_name`: Display name for the application
- `nav_items`: List of navigation links to include

## Customization

Adjust the navigation based on `nav_items` provided. For example, if nav_items includes "Expenses" and "Dashboard":

```html
<ul>
  <li><a href="/expenses">Expenses</a></li>
  <li><a href="/dashboard">Dashboard</a></li>
</ul>
```

## Do Not

- Do not add custom CSS files
- Do not use other CSS frameworks
- Do not create page templates (ui-page agent handles those)
- Do not add JavaScript
