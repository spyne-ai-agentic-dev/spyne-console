import { ChevronDown, Plus } from 'lucide-react';
import { SettingsPageHeader } from './page-header';
import { SaveBar } from './rooftop-profile';

const DEPARTMENTS = [
  { name: 'Sales', kind: 'sales', hours: 'Mon–Fri 9am–7pm · Sat 9am–6pm · Sun closed', phone: '+1 (312) 555-0100', ivr: true, email: 'sales@apexauto.com', open: true },
  { name: 'Service', kind: 'service', hours: 'Mon–Fri 7am–6pm · Sat 8am–2pm · Sun closed', phone: '+1 (312) 555-0200', ivr: true, email: 'service@apexauto.com', open: false },
  { name: 'Parts', kind: 'parts', hours: 'Mon–Fri 8am–5pm · Sat 9am–1pm · Sun closed', phone: '+1 (312) 555-0300', ivr: false, email: 'parts@apexauto.com', open: false },
  { name: 'Finance', kind: 'finance', hours: 'Mon–Fri 9am–6pm', phone: '+1 (312) 555-0400', ivr: false, email: 'finance@apexauto.com', open: false },
];

export function DepartmentDetailsScreen() {
  return (
    <div className="mx-auto max-w-4xl">
      <SettingsPageHeader
        title="Department Details"
        description="Contact info, address, and working hours for each department. Vini answers calls based on these hours."
      />

      <div className="space-y-3">
        {DEPARTMENTS.map((d) => (
          <DepartmentCard key={d.name} {...d} />
        ))}

        <button className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-black-12 bg-white py-3.5 text-sm font-medium text-blue-light hover:bg-blue-4">
          <Plus className="h-4 w-4" /> Add custom department
        </button>
      </div>

      <section className="mt-6 rounded-2xl border border-black-8 bg-white">
        <button className="flex w-full items-center justify-between px-5 py-4">
          <div className="text-left">
            <div className="text-base font-semibold text-black-dark">Holidays</div>
            <div className="text-xs text-black-60">Days the rooftop is closed across all departments.</div>
          </div>
          <ChevronDown className="h-4 w-4 text-black-40" />
        </button>
      </section>

      <SaveBar />
    </div>
  );
}

function DepartmentCard({
  name,
  kind,
  hours,
  phone,
  ivr,
  email,
  open,
}: {
  name: string;
  kind: string;
  hours: string;
  phone: string;
  ivr: boolean;
  email: string;
  open: boolean;
}) {
  return (
    <details className="group rounded-2xl border border-black-8 bg-white" open={open}>
      <summary className="flex cursor-pointer items-center gap-3 px-5 py-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-black-dark">{name}</span>
            <DeptKindBadge kind={kind} />
          </div>
          <div className="mt-0.5 text-xs text-black-60">{hours}</div>
        </div>
        <ChevronDown className="h-4 w-4 text-black-40 transition-transform group-open:rotate-180" />
      </summary>

      <div className="border-t border-black-8 px-5 py-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SmallField label="Phone number" value={phone} />
          <SmallField label="Email" value={email} />
          <SmallField label="Address" value="Same as rooftop" className="md:col-span-2" />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-black-8 bg-gray-lighter px-3.5 py-2.5">
          <div>
            <div className="text-sm font-medium text-black-dark">IVR enabled</div>
            <div className="text-xs text-black-60">Play a recorded greeting before connecting.</div>
          </div>
          <Toggle on={ivr} />
        </div>

        <div className="mt-5">
          <div className="mb-2 text-sm font-semibold text-black-dark">Working hours</div>
          <div className="grid grid-cols-1 gap-2 text-sm text-black-60 md:grid-cols-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="flex items-center justify-between rounded-lg border border-black-8 bg-white px-3 py-1.5">
                <span className="font-medium text-black-dark">{day}</span>
                <span>{day === 'Sun' ? 'Closed' : '9:00 am – 7:00 pm'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}

function SmallField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-sm font-medium text-black-60">{label}</span>
      <input
        type="text"
        defaultValue={value}
        className="w-full rounded-lg border border-black-10 bg-white px-3 py-2 text-sm text-black-dark focus:border-blue-light focus:outline-none"
      />
    </label>
  );
}

function DeptKindBadge({ kind }: { kind: string }) {
  const map: Record<string, string> = {
    sales: 'bg-blue-lighter text-blue-light',
    service: 'bg-green-lighter text-green-do',
    parts: 'bg-black-5 text-black-60',
    finance: 'bg-yellow-soft text-black-60',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${map[kind] || 'bg-black-5 text-black-60'}`}>
      {kind}
    </span>
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
