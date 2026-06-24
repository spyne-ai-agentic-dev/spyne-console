import { SettingsPageHeader } from './page-header';

export function RooftopProfileScreen() {
  return (
    <div className="mx-auto max-w-4xl">
      <SettingsPageHeader
        title="Rooftop Profile"
        description="Name, website, listing URL, and contract details for this rooftop."
        actions={
          <button className="rounded-lg border border-black-10 bg-white px-3.5 py-2 text-sm font-medium text-black-dark hover:bg-gray-lightest">
            View contract
          </button>
        }
      />

      <section className="rounded-2xl border border-black-8 bg-white p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Rooftop name" required>
            <input
              type="text"
              defaultValue="Apex Auto Group — Downtown"
              className="w-full rounded-lg border border-black-10 bg-white px-3 py-2 text-sm text-black-dark placeholder:text-black-40 focus:border-blue-light focus:outline-none"
            />
          </Field>
          <Field label="Website URL" required>
            <input
              type="url"
              defaultValue="https://apexauto.com"
              className="w-full rounded-lg border border-black-10 bg-white px-3 py-2 text-sm text-black-dark placeholder:text-black-40 focus:border-blue-light focus:outline-none"
            />
          </Field>
          <Field label="Address" required className="md:col-span-2">
            <input
              type="text"
              defaultValue="221 W Madison St, Chicago, IL 60606"
              className="w-full rounded-lg border border-black-10 bg-white px-3 py-2 text-sm text-black-dark placeholder:text-black-40 focus:border-blue-light focus:outline-none"
            />
          </Field>
          <Field label="Vehicle listing URL">
            <input
              type="url"
              defaultValue="https://apexauto.com/inventory"
              className="w-full rounded-lg border border-black-10 bg-white px-3 py-2 text-sm text-black-dark placeholder:text-black-40 focus:border-blue-light focus:outline-none"
            />
          </Field>
          <Field label="Time zone">
            <select className="w-full rounded-lg border border-black-10 bg-white px-3 py-2 text-sm text-black-dark focus:border-blue-light focus:outline-none">
              <option>America/Chicago (CST)</option>
              <option>America/New_York (EST)</option>
              <option>America/Los_Angeles (PST)</option>
            </select>
          </Field>
        </div>
      </section>

      <SaveBar />
    </div>
  );
}

function Field({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-sm font-medium text-black-60">
        {label}
        {required && <span className="ml-0.5 text-red-do">*</span>}
      </span>
      {children}
    </label>
  );
}

export function SaveBar() {
  return (
    <div className="sticky bottom-0 mt-6 flex items-center justify-end gap-3 rounded-xl border border-black-8 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
      <span className="text-xs text-black-40">All changes saved</span>
      <button className="rounded-lg bg-blue-light px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
        Save changes
      </button>
    </div>
  );
}
