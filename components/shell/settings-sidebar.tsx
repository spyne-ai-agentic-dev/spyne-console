'use client';

import {
  AppWindow,
  Building2,
  CalendarDays,
  Cog,
  Eye,
  Headphones,
  type LucideIcon,
  Megaphone,
  MessageCircle,
  Phone,
  Plug,
  ScanSearch,
  ShoppingCart,
  Users,
  Wrench,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  SETTINGS_GROUPS,
  SETTINGS_SCREENS,
  type SettingsScreenId,
} from '@/lib/settings-config';

const SCREEN_ICONS: Record<SettingsScreenId, LucideIcon> = {
  rooftop: Building2,
  team: Users,
  departments: CalendarDays,
  'studio-general': Cog,
  'studio-app': AppWindow,
  'studio-smart-campaigns': Megaphone,
  'studio-smart-match': ScanSearch,
  'studio-smart-view': Eye,
  'integrations-vini': Plug,
  telephony: Phone,
  sales: ShoppingCart,
  service: Wrench,
  reception: Headphones,
  chatbot: MessageCircle,
};

interface SettingsSidebarProps {
  activeScreenId: SettingsScreenId;
  onSelect: (id: SettingsScreenId) => void;
}

export function SettingsSidebar({ activeScreenId, onSelect }: SettingsSidebarProps) {
  const grouped = SETTINGS_GROUPS.map((group) => ({
    ...group,
    items: SETTINGS_SCREENS.filter((screen) => screen.group === group.id),
  }));

  return (
    <nav
      aria-label="Settings"
      className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto border-r border-black-8 bg-gray-lighter px-3 py-5"
    >
      {grouped.map((group) => (
        <div key={group.id}>
          <div className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-black-40">
            {group.label}
          </div>
          <ol className="space-y-0.5">
            {group.items.map((screen) => {
              const selected = activeScreenId === screen.id;
              const Icon = SCREEN_ICONS[screen.id];
              return (
                <li key={screen.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(screen.id)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                      selected
                        ? 'bg-white font-semibold text-black-dark shadow-sm'
                        : 'text-black-60 hover:bg-black-4',
                    )}
                  >
                    {Icon && (
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          selected ? 'text-blue-light' : 'text-black-40',
                        )}
                      />
                    )}
                    <span className="flex-1 truncate">{screen.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </nav>
  );
}
