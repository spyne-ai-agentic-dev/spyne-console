import { Search, Plus, Upload, Filter } from 'lucide-react';
import { SettingsPageHeader } from './page-header';

const PEOPLE = [
  { name: 'Sanjay Varnwal', email: 'sanjay@apexauto.com', phone: '+1 (312) 555-0142', dept: 'Owner', role: 'Owner', tagKind: 'green' as const },
  { name: 'Karan Shah', email: 'karan@apexauto.com', phone: '+1 (312) 555-0188', dept: 'Service', role: 'Service advisor', tagKind: 'neutral' as const },
  { name: 'Lucia Diaz', email: 'lucia@apexauto.com', phone: '+1 (312) 555-0177', dept: 'Sales', role: 'Sales manager', tagKind: 'blue' as const },
  { name: 'Marcus Hill', email: 'marcus@apexauto.com', phone: '+1 (312) 555-0166', dept: 'Sales', role: 'Sales agent', tagKind: 'neutral' as const },
  { name: 'Priya Iyer', email: 'priya@apexauto.com', phone: '+1 (312) 555-0155', dept: 'Reception', role: 'Front desk', tagKind: 'neutral' as const },
  { name: 'Ben Cohen', email: 'ben@apexauto.com', phone: '+1 (312) 555-0144', dept: 'Finance', role: 'Finance manager', tagKind: 'blue' as const },
];

export function TeamAndDirectoryScreen() {
  return (
    <div className="mx-auto max-w-6xl">
      <SettingsPageHeader
        title="Team & Directory"
        description="People at this rooftop, their contact details, and which agent capabilities they handle."
        actions={
          <>
            <button className="flex items-center gap-1.5 rounded-lg border border-black-10 bg-white px-3 py-2 text-sm font-medium text-black-dark hover:bg-gray-lightest">
              <Upload className="h-4 w-4" /> Bulk upload
            </button>
            <button className="flex items-center gap-1.5 rounded-lg bg-blue-light px-3 py-2 text-sm font-semibold text-white hover:opacity-90">
              <Plus className="h-4 w-4" /> Add employee
            </button>
          </>
        }
      />

      <div className="rounded-2xl border border-black-8 bg-white">
        <div className="flex items-center gap-3 border-b border-black-8 px-4 py-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black-40" />
            <input
              type="text"
              placeholder="Search by name, email, or phone"
              className="w-full rounded-lg border border-black-10 bg-white py-1.5 pl-9 pr-3 text-sm text-black-dark placeholder:text-black-40 focus:border-blue-light focus:outline-none"
            />
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-black-10 bg-white px-3 py-1.5 text-sm text-black-60 hover:bg-gray-lightest">
            <Filter className="h-3.5 w-3.5" /> Department
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-black-10 bg-white px-3 py-1.5 text-sm text-black-60 hover:bg-gray-lightest">
            <Filter className="h-3.5 w-3.5" /> Capability
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-lighter text-left text-xs font-semibold uppercase tracking-wide text-black-40">
            <tr>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Phone</th>
              <th className="px-4 py-2.5">Department</th>
              <th className="px-4 py-2.5">Role</th>
              <th className="px-4 py-2.5 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {PEOPLE.map((p) => (
              <tr key={p.email} className="border-t border-black-8 hover:bg-gray-lighter/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-8 text-xs font-semibold text-blue-light">
                      {initials(p.name)}
                    </div>
                    <span className="font-medium text-black-dark">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-black-60">{p.email}</td>
                <td className="px-4 py-3 text-black-60">{p.phone}</td>
                <td className="px-4 py-3 text-black-60">{p.dept}</td>
                <td className="px-4 py-3">
                  <Tag kind={p.tagKind}>{p.role}</Tag>
                </td>
                <td className="px-4 py-3 text-right text-black-40">
                  <button aria-label="Row menu" className="rounded p-1 hover:bg-black-4">⋯</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-black-8 px-4 py-3 text-xs text-black-40">
          <span>Showing 1–{PEOPLE.length} of {PEOPLE.length}</span>
          <div className="flex items-center gap-1">
            <button className="rounded-lg border border-black-10 bg-white px-2.5 py-1 hover:bg-gray-lightest">Prev</button>
            <button className="rounded-lg border border-black-10 bg-white px-2.5 py-1 hover:bg-gray-lightest">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((s) => s[0]).join('').toUpperCase();
}

function Tag({ kind, children }: { kind: 'green' | 'blue' | 'neutral'; children: React.ReactNode }) {
  const styles =
    kind === 'green'
      ? 'bg-green-lighter text-green-do'
      : kind === 'blue'
        ? 'bg-blue-lighter text-blue-light'
        : 'bg-black-5 text-black-60';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles}`}>{children}</span>
  );
}
