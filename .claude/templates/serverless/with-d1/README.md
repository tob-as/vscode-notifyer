# D1 Database Add-on

Cloudflare D1 is a serverless SQL database built on SQLite.

## Setup

### 1. Create D1 Database

```bash
# Create database
wrangler d1 create my-database

# Note the database ID from output
```

### 2. Update wrangler.toml

```toml
[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "<your-database-id>"
```

### 3. Create Schema

Create `schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  data TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Apply schema:

```bash
wrangler d1 execute my-database --file=schema.sql
wrangler d1 execute my-database --file=schema.sql --env dev
```

## Usage

```javascript
// Single row
const user = await env.DB.prepare(
  'SELECT * FROM users WHERE id = ?'
).bind(userId).first();

// Multiple rows
const { results } = await env.DB.prepare(
  'SELECT * FROM items WHERE user_id = ?'
).bind(userId).all();

// Insert
const result = await env.DB.prepare(
  'INSERT INTO users (email, name) VALUES (?, ?)'
).bind(email, name).run();
const newId = result.meta.last_row_id;

// Update
await env.DB.prepare(
  'UPDATE users SET name = ? WHERE id = ?'
).bind(newName, userId).run();

// Delete
await env.DB.prepare(
  'DELETE FROM items WHERE id = ?'
).bind(itemId).run();

// Batch operations
await env.DB.batch([
  env.DB.prepare('INSERT INTO items (title) VALUES (?)').bind('Item 1'),
  env.DB.prepare('INSERT INTO items (title) VALUES (?)').bind('Item 2'),
]);
```

## Best Practices

- Use parameterized queries (`.bind()`) to prevent SQL injection
- Use transactions for related operations (`.batch()`)
- Create indexes for frequently queried columns
- Keep queries simple - D1 is SQLite at the edge
