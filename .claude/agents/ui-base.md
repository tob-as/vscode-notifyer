# UI Base Agent (Python)

Create base template with Pico CSS.

## File Ownership

Create ONLY:
- `templates/base.html`

## Template

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
    <ul><li><strong>APP_NAME</strong></li></ul>
    <ul>
      {% block nav %}{% endblock %}
    </ul>
  </nav>
  <main class="container">
    {% block content %}{% endblock %}
  </main>
</body>
</html>
```

## Do Not

- No custom CSS
- No creating page templates
