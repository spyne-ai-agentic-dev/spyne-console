'use client';

import { useState } from 'react';
import { SettingsPageHeader } from './page-header';
import { AgentCard, SaveControls, SubTabs } from './agent-shared';

const KPIS = [
  { label: 'Knowledge sources', value: '24' },
  { label: 'Times referenced (30d)', value: '1,482' },
  { label: 'Active bulletins', value: '3' },
  { label: 'Pending suggestions', value: '7' },
];

const QUICK_FACTS = [
  { category: 'Hours', text: 'Showroom open 7 days/week. Service closed Sunday.', refs: 412 },
  { category: 'Location', text: 'Located at 221 W Madison St, accessible via Blue/Pink/Green lines.', refs: 287 },
  { category: 'EV charging', text: 'Tesla + CCS chargers available in customer lot.', refs: 119 },
  { category: 'Spanish', text: 'Spanish-speaking advisors available Mon–Sat.', refs: 84 },
];

const KB_SECTIONS = ['Quick Facts', 'FAQs', 'Promotions', 'Documents', 'Website Sync', 'Bulletins', 'Suggestions'];

export function ReceptionScreen() {
  return (
    <div className="mx-auto max-w-5xl">
      <SettingsPageHeader
        title="Reception"
        description="Persona, first message, voice test, and deploy for the inbound reception agent. The knowledge base powers what the agent says on every call."
        actions={<SaveControls />}
      />

      <SubTabs
        tabs={[
          {
            id: 'agents',
            label: 'Agents',
            render: () => (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AgentCard
                  variant="inbound"
                  label="Inbound"
                  persona="Noor"
                  subtitle="Routes all incoming calls"
                  voice="Noor (Calm)"
                  languages="English, Spanish"
                  phone="+1 (312) 555-0155"
                />
              </div>
            ),
          },
          { id: 'kb', label: 'Knowledge Base', render: () => <KnowledgeBasePanel /> },
        ]}
      />
    </div>
  );
}

function KnowledgeBasePanel() {
  const [section, setSection] = useState(0);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-xl border border-black-8 bg-white p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-black-40">
              {k.label}
            </div>
            <div className="mt-1 text-2xl font-semibold text-black-dark">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-black-8 bg-white">
        <nav className="flex items-center gap-1 overflow-x-auto border-b border-black-8 p-2">
          {KB_SECTIONS.map((s, i) => (
            <button
              key={s}
              onClick={() => setSection(i)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                i === section ? 'bg-blue-8 text-blue-light' : 'text-black-60 hover:bg-black-4'
              }`}
            >
              {s}
            </button>
          ))}
        </nav>

        {section === 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-lighter text-left text-xs font-semibold uppercase tracking-wide text-black-40">
              <tr>
                <th className="w-32 px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Fact</th>
                <th className="w-32 px-4 py-2.5 text-right">Refs (30d)</th>
              </tr>
            </thead>
            <tbody>
              {QUICK_FACTS.map((f) => (
                <tr key={f.text} className="border-t border-black-8">
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-8 px-2 py-0.5 text-[11px] font-medium text-blue-light">
                      {f.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-black-dark">{f.text}</td>
                  <td className="px-4 py-3 text-right font-medium text-black-60">{f.refs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-4 py-10 text-center text-sm text-black-40">
            {KB_SECTIONS[section]} content
          </div>
        )}
      </div>
    </div>
  );
}
