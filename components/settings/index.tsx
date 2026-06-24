import { ComingSoon } from '@/components/shell/coming-soon';
import type { SettingsScreenId } from '@/lib/settings-config';

import { ChatbotScreen } from './chatbot';
import { DepartmentDetailsScreen } from './department-details';
import { IntegrationsScreen } from './integrations';
import { ReceptionScreen } from './reception';
import { RooftopProfileScreen } from './rooftop-profile';
import { SalesScreen } from './sales';
import { ServiceScreen } from './service';
import { TeamAndDirectoryScreen } from './team-directory';
import { TelephonyScreen } from './telephony';

const STUDIO_COPY: Record<string, { title: string; description: string }> = {
  'studio-general': {
    title: 'Studio AI — General',
    description: 'General settings for Studio AI image and video processing.',
  },
  'studio-app': {
    title: 'Studio AI — App',
    description: 'Background replacement and license-plate masking settings.',
  },
  'studio-smart-campaigns': {
    title: 'Studio AI — Smart Campaigns',
    description: 'Automated marketing campaigns for processed inventory.',
  },
  'studio-smart-match': {
    title: 'Studio AI — Smart Match',
    description: 'VIN matching and inventory lookup.',
  },
  'studio-smart-view': {
    title: 'Studio AI — Smart View',
    description:
      'The 360° spin viewer embedded on your vehicle detail pages, with an optional Vini call-to-action overlay.',
  },
};

export function SettingsScreenContent({ screenId }: { screenId: SettingsScreenId }) {
  switch (screenId) {
    case 'rooftop':
      return <RooftopProfileScreen />;
    case 'team':
      return <TeamAndDirectoryScreen />;
    case 'departments':
      return <DepartmentDetailsScreen />;
    case 'integrations-vini':
      return <IntegrationsScreen />;
    case 'telephony':
      return <TelephonyScreen />;
    case 'sales':
      return <SalesScreen />;
    case 'service':
      return <ServiceScreen />;
    case 'reception':
      return <ReceptionScreen />;
    case 'chatbot':
      return <ChatbotScreen />;
    case 'studio-general':
    case 'studio-app':
    case 'studio-smart-campaigns':
    case 'studio-smart-match':
    case 'studio-smart-view': {
      const copy = STUDIO_COPY[screenId];
      return (
        <ComingSoon
          title={copy.title}
          description={copy.description}
          detail="This screen will be available once Studio AI is set up for this rooftop."
        />
      );
    }
  }
}
