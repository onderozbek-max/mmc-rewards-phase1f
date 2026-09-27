import * as React from 'react';
import { Panel } from '../../components/Panel';
import { IconButton } from '../../components/IconButton';
import { Button } from '../../components/Button';
import { Checkbox } from '../../components/Checkbox';
import { Icon } from '../../components/Icons';
import { Heading, Body, Caption } from '../../components/Text';
import { Divider } from '../../components/Divider';
import { SCENARIOS, ScenarioId } from '../../mmc/scenarios';
import { TestingOpportunityAvailability } from '../../mmc/types';

interface DemoControlsPanelProps {
  currentScenarioId: ScenarioId;
  onSelectScenario: (id: ScenarioId) => void;
  testingOpportunities: TestingOpportunityAvailability;
  onSetTestingOpportunity: (kind: 'basic' | 'premium', available: boolean) => void;
}

/**
 * Prototype-only scenario switcher (spec §27/§34). Lets Product/Design
 * replay any representative new-member / existing-member / reconciliation-
 * error state (A-J) and independently toggle whether a matching testing
 * opportunity currently exists — eligibility (points) and opportunity supply
 * are deliberately independent concepts (spec §15/§17-20/§21), so
 * opportunity availability is its own control here rather than something
 * derived from the scenario's point total.
 *
 * This is stakeholder/demo tooling, not member-facing MMC UI.
 */
export function DemoControlsPanel({ currentScenarioId, onSelectScenario, testingOpportunities, onSetTestingOpportunity }: DemoControlsPanelProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 5 }}>
        <IconButton a11yLabel="Demo controls" variant="ghost" size="small" onClick={() => setIsOpen(true)}>
          <Icon name="Gear" decorative size="small" />
        </IconButton>
      </div>

      <Panel isOpen={isOpen} title="Demo controls" onClose={() => setIsOpen(false)} position="right" size="small">
        <Caption color="subtle" as="p" UNSAFE_style={{ marginBottom: 16 }}>
          Prototype-only — replay any Phase 1F scenario. Not part of the member experience.
        </Caption>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SCENARIOS.map((scenario) => {
            const isActive = scenario.id === currentScenarioId;
            return (
              <div
                key={scenario.id}
                style={{
                  border: isActive ? '2px solid var(--ld-semantic-color-border-brand, #0062ad)' : '1px solid var(--ld-semantic-color-border-subtle, #e3e4e5)',
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <Heading as="h3" size="small" UNSAFE_style={{ marginBottom: 4 }}>{scenario.label}</Heading>
                <Body size="small" color="subtle" as="p" UNSAFE_style={{ marginBottom: 8 }}>{scenario.description}</Body>
                <Button
                  variant={isActive ? 'secondary' : 'primary'}
                  size="small"
                  isFullWidth
                  onClick={() => {
                    onSelectScenario(scenario.id);
                    setIsOpen(false);
                  }}
                >
                  {isActive ? 'Reset this scenario' : 'Load scenario'}
                </Button>
              </div>
            );
          })}
        </div>

        <div style={{ margin: '20px 0' }}><Divider /></div>

        <Heading as="h3" size="small" UNSAFE_style={{ marginBottom: 8 }}>Testing opportunity supply</Heading>
        <Caption color="subtle" as="p" UNSAFE_style={{ marginBottom: 12 }}>
          Independent of points — controls whether the Product Testing surface shows a matching opportunity or the
          truthful no-opportunity state.
        </Caption>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
          <Checkbox
            label="Basic opportunity available"
            checked={testingOpportunities.basic}
            onChange={(e) => onSetTestingOpportunity('basic', e.target.checked)}
          />
          <Checkbox
            label="Premium opportunity available"
            checked={testingOpportunities.premium}
            onChange={(e) => onSetTestingOpportunity('premium', e.target.checked)}
          />
        </div>

        <div style={{ margin: '20px 0' }}><Divider /></div>
        <Caption color="subtle" as="p">
          These controls exist only to demonstrate Phase 1F for stakeholders — they do not appear in the real MMC app.
        </Caption>
      </Panel>
    </>
  );
}
