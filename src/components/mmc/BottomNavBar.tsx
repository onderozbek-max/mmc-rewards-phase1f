import * as React from 'react';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icons';
import { Caption } from '../../components/Text';

export type NavTab = 'home' | 'scan' | 'reorder' | 'account' | 'services';

const TABS: { id: NavTab; label: string; icon: string; iconFill: string }[] = [
  { id: 'home', label: 'Home', icon: 'Home', iconFill: 'Home' },
  { id: 'scan', label: 'Scan & Go', icon: 'ScanAndGo', iconFill: 'ScanAndGoFill' },
  { id: 'reorder', label: 'Reorder', icon: 'Reorder', iconFill: 'ReorderFill' },
  { id: 'account', label: 'Account', icon: 'User', iconFill: 'UserCircleFill' },
  { id: 'services', label: 'Services', icon: 'Services', iconFill: 'ServicesFill' },
];

interface BottomNavBarProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

/**
 * Preserved 5-tab bottom navigation matching the established MMC mobile
 * shell (Home / Scan & Go / Reorder / Account / Services). Only Home and
 * Account route anywhere in this prototype — Scan & Go / Reorder / Services
 * are out of scope for this prototype and are inert by design (no fabricated
 * destinations), matching the "don't redesign navigation" instruction.
 */
export function BottomNavBar({ active, onChange }: BottomNavBarProps) {
  return (
    <nav
      aria-label="Primary"
      style={{
        display: 'flex',
        borderTop: '1px solid var(--ld-semantic-color-border-subtle, #e3e4e5)',
        background: 'var(--ld-semantic-color-fill, #fff)',
        padding: '6px 4px 10px',
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        return (
          <Button
            key={tab.id}
            variant="ghost"
            isFullWidth
            onClick={() => onChange(tab.id)}
            UNSAFE_style={{
              flexDirection: 'column',
              gap: 2,
              height: 'auto',
              padding: '4px 2px',
              color: isActive
                ? 'var(--ld-semantic-color-text-brand, #0062ad)'
                : 'var(--ld-semantic-color-text-subtle, #74767c)',
            }}
          >
            <Icon name={isActive ? tab.iconFill : tab.icon} decorative size="medium" />
            <Caption color={isActive ? 'brand' : 'subtle'}>{tab.label}</Caption>
          </Button>
        );
      })}
    </nav>
  );
}
