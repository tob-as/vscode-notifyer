import type { ReactNode } from "react";

interface HeaderProps {
  title?: string;
  logo?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}

export function Header({ title, logo, actions, children }: HeaderProps) {
  return (
    <div className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {logo && <div className="flex-shrink-0">{logo}</div>}
        {title && <h1 className="text-lg font-semibold">{title}</h1>}
        {children}
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
