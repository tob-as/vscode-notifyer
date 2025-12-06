# UI Design Standards

## Framework

Use Pico CSS in dark mode. No other CSS frameworks.

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
  <title>App Name</title>
</head>
```

## Layout

Use semantic HTML. Pico styles these automatically:

```html
<body>
  <nav class="container">
    <ul><li><strong>App Name</strong></li></ul>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/items">Items</a></li>
    </ul>
  </nav>

  <main class="container">
    <!-- Page content -->
  </main>

  <footer class="container">
    <small>© 2025</small>
  </footer>
</body>
```

## Components

### Buttons

```html
<button>Primary</button>
<button class="secondary">Secondary</button>
<button class="outline">Outline</button>
<button class="contrast">Contrast</button>
```

### Forms

```html
<form>
  <label>
    Name
    <input type="text" name="name" required>
  </label>

  <label>
    Email
    <input type="email" name="email" required>
  </label>

  <label>
    Category
    <select name="category" required>
      <option value="">Select...</option>
      <option value="a">Option A</option>
      <option value="b">Option B</option>
    </select>
  </label>

  <label>
    <input type="checkbox" name="agree">
    I agree to terms
  </label>

  <button type="submit">Submit</button>
</form>
```

### Cards

Use `<article>` for cards:

```html
<article>
  <header>Card Title</header>
  <p>Card content goes here.</p>
  <footer>
    <button class="outline">Action</button>
  </footer>
</article>
```

### Tables

```html
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Item 1</td>
      <td>Active</td>
      <td><a href="/items/1">View</a></td>
    </tr>
  </tbody>
</table>
```

### Grid

Use CSS grid or Pico's grid class:

```html
<div class="grid">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>
```

### Loading State

```html
<button aria-busy="true">Loading...</button>
<article aria-busy="true">Loading content...</article>
```

### Dialogs/Modals

```html
<dialog open>
  <article>
    <header>Confirm</header>
    <p>Are you sure?</p>
    <footer>
      <button class="secondary">Cancel</button>
      <button>Confirm</button>
    </footer>
  </article>
</dialog>
```

## Status Indicators

Use semantic elements with roles:

```html
<ins>Approved</ins>    <!-- Green, positive -->
<del>Rejected</del>    <!-- Red, negative -->
<mark>Pending</mark>   <!-- Yellow, attention -->
```

Or use small badges:

```html
<small style="color: var(--pico-ins-color);">● Active</small>
<small style="color: var(--pico-del-color);">● Inactive</small>
```

## Icons

No icon libraries. Use simple text or unicode:

```html
<button>+ Add New</button>
<button>← Back</button>
<a href="/edit">Edit ✎</a>
```

## Do Not

- Do not use other CSS frameworks (Bootstrap, Tailwind, etc.)
- Do not add custom CSS unless absolutely necessary
- Do not use JavaScript frameworks (React, Vue, etc.)
- Do not use icon libraries (FontAwesome, etc.)
- Do not override Pico's dark mode colors
