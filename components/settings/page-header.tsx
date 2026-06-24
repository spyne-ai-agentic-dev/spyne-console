import type { ReactNode } from 'react';

interface SettingsPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function SettingsPageHeader({ title, description, actions }: SettingsPageHeaderProps) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-black-dark">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-black-60">{description}</p>
        )}
      </div>
      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
    </header>
  );
}
