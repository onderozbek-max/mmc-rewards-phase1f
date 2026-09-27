import * as React from 'react';
import { IconButton } from '../../components/IconButton';
import { Icon } from '../../components/Icons';
import { Heading } from '../../components/Text';

interface TopBarProps {
  label: string;
  onBack: () => void;
}

/**
 * Decorative nav bar (back chevron + centered label). This label is NOT a
 * heading element — the real, single visible section heading for each page
 * is rendered in the page body (see the `titleVisuallyHidden` Page pattern
 * used by HomePage / ProfilePage / CommunityPassPage). Rendering this as a
 * plain `span` avoids a duplicate/competing heading in the document outline.
 */
export function TopBar({ label, onBack }: TopBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '14px 8px',
        borderBottom: '1px solid var(--ld-semantic-color-border-subtle, #e3e4e5)',
      }}
    >
      <div style={{ position: 'absolute', left: 4 }}>
        <IconButton a11yLabel="Back" variant="ghost" size="medium" onClick={onBack}>
          <Icon name="ChevronLeft" decorative />
        </IconButton>
      </div>
      <Heading as="span" size="small" weight="alt">
        {label}
      </Heading>
    </div>
  );
}
