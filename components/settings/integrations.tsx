import { Mail, Plus, Search, Check, Pencil } from 'lucide-react';
import { SettingsPageHeader } from './page-header';

const CAPABILITY_FILTERS = ['All', 'CRM', 'DMS', 'IMS', 'Photo Provider', 'Car History', 'Service Scheduler'];

const ACTIVE_INTEGRATIONS = [
  {
    name: 'VinSolutions',
    logo: 'VS',
    description: 'CRM + DMS sync for inventory, leads, and dealer info.',
    dealerId: 'DLR-48217',
    capabilities: [
      { label: 'CRM', enabled: true },
      { label: 'DMS', enabled: true },
      { label: 'IMS', enabled: false },
      { label: 'Lead push', enabled: true },
    ],
  },
  {
    name: 'Carfax',
    logo: 'CF',
    description: 'Vehicle history reports for trade-in and CPO checks.',
    dealerId: 'CFX-9921',
    capabilities: [
      { label: 'Car history', enabled: true },
    ],
  },
  {
    name: 'Xtime',
    logo: 'XT',
    description: 'Service scheduling — appointments sync into Service agent.',
    dealerId: 'XT-44012',
    capabilities: [
      { label: 'Service scheduler', enabled: true },
    ],
  },
];

export function IntegrationsScreen() {
  return (
    <div className="mx-auto max-w-5xl">
      <SettingsPageHeader
        title="Integrations"
        description="Connect CRM, DMS, inventory, vehicle history, and service-scheduler partners. Vini reads and writes through these systems on calls."
        actions={
          <>
            <button className="flex items-center gap-1.5 rounded-lg border border-black-10 bg-white px-3 py-2 text-sm font-medium text-black-dark hover:bg-gray-lightest">
              <Mail className="h-4 w-4" /> Request new integration
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-blue-light px-3 py-2 text-sm font-semibold text-white hover:opacity-90">
              <Plus className="h-4 w-4" /> Add integration partner
            </button>
          </>
        }
      />

      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-black-8 bg-white p-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black-40" />
          <input
            type="text"
            placeholder="Search integrations"
            className="w-full rounded-lg border border-transparent bg-gray-lighter py-1.5 pl-9 pr-3 text-sm text-black-dark placeholder:text-black-40 focus:border-blue-light focus:bg-white focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pr-2">
          {CAPABILITY_FILTERS.map((c, i) => (
            <button
              key={c}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                i === 0
                  ? 'bg-blue-light text-white'
                  : 'text-black-60 hover:bg-black-4'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {ACTIVE_INTEGRATIONS.map((integration) => (
          <article
            key={integration.name}
            className="rounded-2xl border border-black-8 bg-white p-5"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-8 text-sm font-bold text-blue-light">
                {integration.logo}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-black-dark">{integration.name}</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-lighter px-2 py-0.5 text-[11px] font-medium text-green-do">
                    <Check className="h-3 w-3" /> Active
                  </span>
                </div>
                <p className="mt-1 text-sm text-black-60">{integration.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {integration.capabilities.map((c) => (
                    <span
                      key={c.label}
                      className={`rounded-md px-2 py-0.5 text-xs ${
                        c.enabled
                          ? 'bg-blue-8 text-blue-light'
                          : 'bg-black-5 text-black-40 line-through'
                      }`}
                    >
                      {c.label}
                    </span>
                  ))}
                </div>
                <div className="mt-3 text-xs text-black-40">
                  Dealer ID: <span className="font-mono text-black-60">{integration.dealerId}</span>
                </div>
              </div>
              <button className="flex shrink-0 items-center gap-1.5 rounded-lg border border-black-10 bg-white px-3 py-1.5 text-sm font-medium text-black-dark hover:bg-gray-lightest">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
