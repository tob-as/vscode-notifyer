import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
}

export function AppShell({ children, header, sidebar, footer }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {header && <header className="sticky top-0 z-50">{header}</header>}

      <div className="flex flex-1">
        {sidebar && (
          <aside className="hidden md:flex w-64 flex-col border-r">
            {sidebar}
          </aside>
        )}

        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {footer && <footer className="border-t">{footer}</footer>}
    </div>
  );
}
