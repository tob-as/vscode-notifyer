import type { ReactNode } from "react";

interface DocumentProps {
  children: ReactNode;
}

export function Document({ children }: DocumentProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{{APP_NAME}}</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <div id="app">{children}</div>
      </body>
    </html>
  );
}
