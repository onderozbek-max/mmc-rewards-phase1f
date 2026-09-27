import * as React from 'react';
import { PhoneShell } from './PhoneShell';
import { Heading, Body, Caption } from '../../components/Text';
import { Tag } from '../../components/Tag';
import { Divider } from '../../components/Divider';

/**
 * Desktop-only stakeholder review chrome. This is metadata FOR reviewers,
 * not MMC member-facing UI — it must read as clearly separate from the
 * simulated phone. At mobile-sized browser widths this entire panel is
 * hidden via the media query below, leaving just the app filling the
 * viewport as it would on a real device.
 */
export function StakeholderShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mmc-stakeholder-shell">
      <style>{`
        .mmc-stakeholder-shell {
          min-height: 100vh;
          background: #f2f2f3;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          gap: 56px;
          padding: 56px 32px;
        }
        .mmc-stakeholder-info {
          max-width: 460px;
          padding-top: 8px;
        }
        @media (max-width: 768px) {
          .mmc-stakeholder-shell {
            display: block;
            min-height: 100dvh;
            background: #fff;
            padding: 0;
            gap: 0;
          }
          .mmc-stakeholder-info {
            display: none;
          }
        }
      `}</style>

      <PhoneShell>{children}</PhoneShell>

      <div className="mmc-stakeholder-info">
        <div style={{ marginBottom: 16 }}>
          <Tag color="brand" variant="primary">Phase 1F</Tag>
        </div>
        <Heading as="h2" size="large" UNSAFE_style={{ marginBottom: 4 }}>
          Historical Reconciliation &amp; Full Population Rollout
        </Heading>
        <Body size="medium" color="subtle" as="p" weight="alt" UNSAFE_style={{ marginBottom: 24 }}>
          Initiative type: Build + Measure
        </Body>

        <Section title="Why this increment exists">
          <Body size="medium" as="p" UNSAFE_style={{ marginBottom: 16 }}>
            HONOR THE CONTRIBUTION MEMBERS HAVE ALREADY MADE.
          </Body>
          <Caption color="subtle" as="p" weight="alt" UNSAFE_style={{ marginBottom: 8 }}>BEFORE 1F</Caption>
          <Body size="medium" as="p" UNSAFE_style={{ marginBottom: 16 }}>
            Community Pass is functionally complete across the aligned point spectrum, but the product does not
            define how existing members with historical points enter it.
          </Body>
          <Caption color="subtle" as="p" weight="alt" UNSAFE_style={{ marginBottom: 8 }}>AFTER 1F</Caption>
          <Body size="medium" as="p">
            Every eligible member enters Community Pass with their historical lifetime contribution recognized and
            the correct cumulative benefits immediately available.
          </Body>
        </Section>

        <Section title="What 1F adds">
          <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li><Body size="medium">Historical lifetime-point reconciliation</Body></li>
            <li><Body size="medium">Derived historical milestone state</Body></li>
            <li><Body size="medium">Immediate cumulative benefit entitlement</Body></li>
            <li><Body size="medium">One-time reconciliation orientation</Body></li>
            <li><Body size="medium">Suppression of fake historical milestone ceremonies</Body></li>
            <li><Body size="medium">Full-population entry</Body></li>
            <li><Body size="medium">Convergence onto the same normal Community Pass product</Body></li>
            <li><Body size="medium">Reconciliation failure / pending state</Body></li>
          </ul>
        </Section>

        <Section title="Critical distinction">
          <Body size="medium" as="p" UNSAFE_style={{ marginBottom: 8 }}>
            Historical reconciliation: <em>"You already qualified for these benefits."</em>
          </Body>
          <Body size="medium" as="p">
            Live milestone achievement: <em>"You just reached this milestone."</em>
          </Body>
        </Section>

        <Section title="Representative member — 1,500 historical points">
          <Body size="medium" as="p" UNSAFE_style={{ marginBottom: 8 }}>Already available:</Body>
          <Caption color="subtle" isMonospace as="p" UNSAFE_style={{ marginBottom: 8 }}>
            Community content · Basic product-testing eligibility
          </Caption>
          <Body size="medium" as="p" UNSAFE_style={{ marginBottom: 8 }}>Next: 3,000 points → Premium product-testing eligibility.</Body>
          <Body size="medium" as="p" color="subtle">No 250/1,000 achievement ceremonies replay.</Body>
        </Section>

        <Section title="What to evaluate">
          <Body size="medium" as="p" UNSAFE_style={{ marginBottom: 8 }}>Does the experience:</Body>
          <ul style={{ margin: '0 0 12px', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <li><Body size="medium">recognize prior contribution?</Body></li>
            <li><Body size="medium">avoid making members start over?</Body></li>
            <li><Body size="medium">make already-earned value immediately available?</Body></li>
            <li><Body size="medium">avoid fake celebration?</Body></li>
            <li><Body size="medium">transition cleanly into normal future progression?</Body></li>
          </ul>
        </Section>

        <div style={{ margin: '24px 0' }}><Divider /></div>

        <Section title="Phase 1 complete when">
          <Body size="medium" as="p">
            The progression system works coherently for: new members; existing members below 250; existing members
            between milestones; existing members above all currently aligned milestones; and members whose
            historical data cannot yet be safely reconciled.
          </Body>
        </Section>

        <div style={{ margin: '24px 0' }}><Divider /></div>

        <Section title="Phase progression">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <PhaseRow label="1A · Progression Foundation" status="Complete ✓" />
            <PhaseRow label="1B · Progress Motivation" status="Assumed adopted ✓*" />
            <PhaseRow label="1C · Earn &amp; Progress Feedback" status="Complete ✓" />
            <PhaseRow label="1D · Milestone Achievement" status="Complete ✓" />
            <PhaseRow label="1E · Multi-Milestone Progression" status="Complete ✓" />
            <PhaseRow label="1F · Historical Reconciliation &amp; Rollout" status="Current" isCurrent />
          </div>
          <Caption color="subtle" as="p" UNSAFE_style={{ marginTop: 12 }}>
            *1B carries forward under the assumed positive experiment outcome.
          </Caption>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <Heading as="h3" size="small" UNSAFE_style={{ marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        {title}
      </Heading>
      {children}
    </div>
  );
}

function PhaseRow({ label, status, isCurrent }: { label: string; status: string; isCurrent?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        borderRadius: 8,
        background: isCurrent ? 'var(--ld-semantic-color-fill-brand-subtle, #e9f1fe)' : 'transparent',
        border: isCurrent ? '1px solid var(--ld-semantic-color-border-brand, #0053e2)' : '1px solid transparent',
      }}
    >
      <Body size="medium" weight={isCurrent ? 'alt' : 'default'}>
        {label}
      </Body>
      <Caption color={isCurrent ? 'brand' : 'subtle'} weight="alt">{status}</Caption>
    </div>
  );
}
