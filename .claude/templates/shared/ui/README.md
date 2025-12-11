# Shared UI Components

Copy-paste ready React components with Tailwind CSS. Inspired by shadcn/ui.

## Setup

### 1. Install Tailwind CSS

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Copy Configuration

Copy these files to your project:
- `tailwind.config.js` - Tailwind configuration
- `globals.css` - Base styles and CSS variables

### 3. Import Styles

```tsx
// main.tsx or App.tsx
import "./globals.css";
```

## Components

### Layout

| Component | Description |
|-----------|-------------|
| `AppShell` | Main layout with header, sidebar, footer |
| `Header` | Top navigation bar |
| `Container` | Centered content container |

### Forms

| Component | Description |
|-----------|-------------|
| `Button` | Button with variants |
| `Input` | Text input with label and error |
| `Select` | Select dropdown |

### Data

| Component | Description |
|-----------|-------------|
| `Card` | Card container with header, content, footer |

### Feedback

| Component | Description |
|-----------|-------------|
| `Toast` | Toast notifications (requires ToastProvider) |
| `Loading` | Loading spinner |
| `LoadingOverlay` | Full-screen loading overlay |

## Usage Examples

### Button

```tsx
import { Button } from "./components/forms/Button";

<Button variant="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="sm">Small</Button>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "./components/data/Card";

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

### Toast

```tsx
import { ToastProvider, useToast } from "./components/feedback/Toast";

// Wrap app with provider
<ToastProvider>
  <App />
</ToastProvider>

// Use in component
function MyComponent() {
  const { addToast } = useToast();

  return (
    <Button onClick={() => addToast({ message: "Saved!", type: "success" })}>
      Save
    </Button>
  );
}
```

### AppShell

```tsx
import { AppShell } from "./components/layout/AppShell";
import { Header } from "./components/layout/Header";

<AppShell
  header={<Header title="My App" />}
  sidebar={<Sidebar />}
>
  <main>Content</main>
</AppShell>
```

## Dark Mode

Dark mode is supported via the `dark` class on the `<html>` element:

```tsx
// Toggle dark mode
document.documentElement.classList.toggle("dark");
```

Or detect system preference:

```tsx
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
if (prefersDark) {
  document.documentElement.classList.add("dark");
}
```

## Customization

### Colors

Edit CSS variables in `globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* HSL values */
  --destructive: 0 84.2% 60.2%;
  /* ... */
}
```

### Border Radius

```css
:root {
  --radius: 0.5rem;  /* Change global border radius */
}
```
