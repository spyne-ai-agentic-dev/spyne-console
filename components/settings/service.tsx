import { SettingsPageHeader } from './page-header';
import { AgentCard, SaveControls } from './agent-shared';

export function ServiceScreen() {
  return (
    <div className="mx-auto max-w-5xl">
      <SettingsPageHeader
        title="Service"
        description="Persona, first message, voice test, and deploy for the inbound service agent."
        actions={<SaveControls />}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AgentCard
          variant="inbound"
          label="Inbound"
          persona="Riya"
          subtitle="Handles all incoming service calls"
          voice="Riya (Friendly)"
          languages="English, Spanish"
          phone="+1 (312) 555-0188"
        />
      </div>

      <section className="mt-8 rounded-2xl border border-black-10 bg-white p-5">
        <h2 className="text-base font-semibold text-black-dark">
          Where service is configured
        </h2>
        <p className="mt-1 text-sm text-black-60">
          Service Facilities (loaners, pickup, drop box, roadside) live under{' '}
          <span className="font-medium text-black-dark">
            Account → Department Details → Service
          </span>
          . Human transfer happens on customer request and is not configured here.
        </p>
      </section>
    </div>
  );
}
