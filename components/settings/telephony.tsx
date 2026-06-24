import { Check, Phone } from 'lucide-react';
import { SettingsPageHeader } from './page-header';

const NUMBERS = [
  { label: 'Inbound Sales', number: '+1 (312) 555-0142', assigned: true },
  { label: 'Inbound Service', number: '+1 (312) 555-0188', assigned: true },
  { label: 'Outbound Sales', number: '+1 (312) 555-0166', assigned: true },
  { label: 'Reception', number: 'Not assigned', assigned: false },
];

export function TelephonyScreen() {
  return (
    <div className="mx-auto max-w-4xl">
      <SettingsPageHeader
        title="Telephony"
        description="Caller ID registration and the phone numbers Vini's agents use."
      />

      <section className="mb-8 rounded-2xl border border-black-8 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-black-dark">Caller ID Registration (CNAM)</h2>
            <p className="mt-1 text-sm text-black-60">
              Register your business so your name displays on US outbound calls. Required for outbound Sales.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-green-lighter px-2 py-0.5 text-[11px] font-medium text-green-do">
            <Check className="h-3 w-3" /> Verified
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Read label="Legal business name" value="Apex Auto Group LLC" />
          <Read label="Caller ID display" value="APEX AUTO" />
          <Read label="Business type" value="Limited Liability Company" />
          <Read label="Business industry" value="Automotive Retail" />
          <Read label="EIN" value="••–•••2987" />
          <Read label="Representative" value="Sanjay Varnwal" />
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-base font-semibold text-black-dark">Phone Numbers</h2>
        <p className="mb-4 text-sm text-black-60">Assign a number to each call type.</p>

        <div className="space-y-2">
          {NUMBERS.map((n) => (
            <div
              key={n.label}
              className="flex items-center justify-between rounded-xl border border-black-8 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-8 text-blue-light">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-black-dark">{n.label}</div>
                  <div className={`text-xs ${n.assigned ? 'text-black-60' : 'text-black-40'}`}>
                    {n.number}
                  </div>
                </div>
              </div>
              {n.assigned ? (
                <button className="rounded-lg border border-black-10 bg-white px-3 py-1.5 text-sm font-medium text-black-dark hover:bg-gray-lightest">
                  Re-assign
                </button>
              ) : (
                <button className="rounded-lg bg-blue-light px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90">
                  Assign number
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Read({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-black-40">{label}</div>
      <div className="mt-0.5 text-sm text-black-dark">{value}</div>
    </div>
  );
}
