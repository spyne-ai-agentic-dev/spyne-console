import type { ReactNode } from 'react';

interface ComingSoonProps {
  title: string;
  description?: string;
  detail?: ReactNode;
}

export function ComingSoon({ title, description, detail }: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-2xl px-8 py-16 text-center">
      <h1 className="text-2xl font-semibold text-black-dark">{title}</h1>
      {description && (
        <p className="mt-2 text-sm text-black-60">{description}</p>
      )}
      <div className="mt-8 inline-block rounded-full bg-blue-8 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-light">
        Coming soon
      </div>
      {detail && <div className="mt-6 text-sm text-black-60">{detail}</div>}
    </div>
  );
}
