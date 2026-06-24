export type SettingsGroupId = 'account' | 'studio' | 'integrations' | 'vini';

export type SettingsScreenId =
  | 'rooftop'
  | 'team'
  | 'departments'
  | 'studio-general'
  | 'studio-app'
  | 'studio-smart-campaigns'
  | 'studio-smart-match'
  | 'studio-smart-view'
  | 'integrations-vini'
  | 'telephony'
  | 'sales'
  | 'service'
  | 'reception'
  | 'chatbot';

export interface SettingsGroup {
  id: SettingsGroupId;
  label: string;
}

export interface SettingsScreen {
  id: SettingsScreenId;
  label: string;
  group: SettingsGroupId;
}

export const SETTINGS_GROUPS: SettingsGroup[] = [
  { id: 'account', label: 'Account' },
  { id: 'studio', label: 'Studio AI' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'vini', label: 'Vini AI' },
];

export const SETTINGS_SCREENS: SettingsScreen[] = [
  { id: 'rooftop', label: 'Rooftop Profile', group: 'account' },
  { id: 'team', label: 'Team & Directory', group: 'account' },
  { id: 'departments', label: 'Department Details', group: 'account' },

  { id: 'studio-general', label: 'General', group: 'studio' },
  { id: 'studio-app', label: 'App', group: 'studio' },
  { id: 'studio-smart-campaigns', label: 'Smart Campaigns', group: 'studio' },
  { id: 'studio-smart-match', label: 'Smart Match', group: 'studio' },
  { id: 'studio-smart-view', label: 'Smart View', group: 'studio' },

  { id: 'integrations-vini', label: 'Integrations', group: 'integrations' },

  { id: 'telephony', label: 'Telephony', group: 'vini' },
  { id: 'sales', label: 'Sales', group: 'vini' },
  { id: 'service', label: 'Service', group: 'vini' },
  { id: 'reception', label: 'Reception', group: 'vini' },
  { id: 'chatbot', label: 'Chatbot', group: 'vini' },
];

export const DEFAULT_SETTINGS_SCREEN: SettingsScreenId = 'rooftop';
