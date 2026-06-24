import { SettingsPageHeader } from './page-header';

export function ChatbotScreen() {
  return (
    <div className="mx-auto max-w-4xl">
      <SettingsPageHeader
        title="Chatbot"
        description="The chat widget on your website. Turn it on or off, customize how it looks, and set the messages it suggests."
      />

      <div className="space-y-4">
        <section className="flex items-center justify-between rounded-2xl border border-black-8 bg-white p-5">
          <div>
            <div className="text-base font-semibold text-black-dark">Enable website chatbot</div>
            <p className="mt-0.5 text-sm text-black-60">
              When on, visitors can chat with Vini directly from your website.
            </p>
          </div>
          <Toggle on />
        </section>

        <section className="rounded-2xl border border-black-8 bg-white p-5">
          <h2 className="text-base font-semibold text-black-dark">Appearance</h2>
          <p className="mt-1 text-sm text-black-60">Applies to both Sales and Service entry points.</p>

          <div className="mt-5 space-y-4">
            <RadioGroup
              label="Entry point"
              options={['Floating bubble', 'Pinned to corner']}
              active={0}
            />
            <RadioGroup label="Theme" options={['System', 'Light', 'Dark']} active={1} />
          </div>
        </section>

        <section className="rounded-2xl border border-black-8 bg-white p-5">
          <h2 className="text-base font-semibold text-black-dark">Sales — pages &amp; entry suggestions</h2>
          <p className="mt-1 text-sm text-black-60">Shown on inventory and finance pages.</p>

          <div className="mt-5 space-y-4">
            <Field label="Pages to show on">
              <textarea
                rows={3}
                defaultValue={'/inventory/*\n/financing'}
                className="w-full rounded-lg border border-black-10 bg-white px-3 py-2 font-mono text-xs text-black-dark focus:border-blue-light focus:outline-none"
              />
            </Field>
            <Field label="Entry suggestions (one per line)">
              <textarea
                rows={3}
                defaultValue={'How much is my trade-in worth?\nDo you have this in another color?\nCan I schedule a test drive?'}
                className="w-full rounded-lg border border-black-10 bg-white px-3 py-2 text-sm text-black-dark focus:border-blue-light focus:outline-none"
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-black-8 bg-white p-5">
          <h2 className="text-base font-semibold text-black-dark">Service — pages &amp; entry suggestions</h2>
          <p className="mt-1 text-sm text-black-60">Shown on service and parts pages.</p>

          <div className="mt-5 space-y-4">
            <Field label="Pages to show on">
              <textarea
                rows={2}
                defaultValue={'/service/*\n/parts'}
                className="w-full rounded-lg border border-black-10 bg-white px-3 py-2 font-mono text-xs text-black-dark focus:border-blue-light focus:outline-none"
              />
            </Field>
            <Field label="Entry suggestions (one per line)">
              <textarea
                rows={3}
                defaultValue={'Schedule an oil change\nWhat are today\'s service hours?\nDo you offer loaner cars?'}
                className="w-full rounded-lg border border-black-10 bg-white px-3 py-2 text-sm text-black-dark focus:border-blue-light focus:outline-none"
              />
            </Field>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-black-60">{label}</span>
      {children}
    </label>
  );
}

function RadioGroup({ label, options, active }: { label: string; options: string[]; active: number }) {
  return (
    <div>
      <div className="mb-1.5 text-sm font-medium text-black-60">{label}</div>
      <div className="flex flex-wrap items-center gap-2">
        {options.map((o, i) => (
          <button
            key={o}
            className={`rounded-lg border px-4 py-1.5 text-sm capitalize transition-colors ${
              i === active
                ? 'border-blue-light bg-blue-8 text-blue-light'
                : 'border-black-10 bg-white text-black-60 hover:bg-gray-lightest'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        on ? 'bg-blue-light' : 'bg-black-12'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          on ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </span>
  );
}
