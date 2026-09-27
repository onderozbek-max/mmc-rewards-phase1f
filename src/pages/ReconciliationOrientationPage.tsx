import * as React from 'react';
import { Page } from '../components/Page';
import { Icon } from '../components/Icons';
import { Heading, Body, Caption } from '../components/Text';
import { Button } from '../components/Button';
import { useMMC } from '../mmc/useMMCStore';
import { MILESTONES, capitalize, benefitLabelList } from '../mmc/data';

/**
 * The one-time, first-entry historical-reconciliation ORIENTATION (spec
 * §7-13) for existing members. This is orientation, not celebration: no
 * confetti, no per-milestone ceremony, no implication that points were just
 * earned or gifted. It communicates exactly three things, scaled to whatever
 * band the member's historical points landed in (spec §8):
 *   1. your points were recognized
 *   2. these benefits are already available
 *   3. this is what comes next, if anything
 *
 * Entitlements themselves are already true in product state before this
 * screen ever renders — `milestonesReached` was seeded at reconciliation
 * time (see scenarios.ts), not by pressing Continue here (spec §15). This
 * component only reads already-derived context values; it computes nothing
 * member-specific itself, so it cannot drift from the real product state.
 */
export function ReconciliationOrientationPage() {
  const { lifetimePoints, milestonesReached, nextMilestonePoints, nextBenefits, acknowledgeReconciliation } = useMMC();

  if (lifetimePoints == null) return null; // reconciliation-error path is a separate screen

  const achievedMilestones = MILESTONES.filter((m) => milestonesReached.includes(m.points));
  const nextBenefitLabel = nextBenefits.length ? capitalize(benefitLabelList(nextBenefits)) : null;
  const pointsRemaining = nextMilestonePoints != null ? Math.max(nextMilestonePoints - lifetimePoints, 0) : null;

  return (
    <Page title="Your Community participation counts" titleVisuallyHidden>
      <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', inset: 0 }}>
        <div
          role="region"
          aria-label="Community Pass orientation"
          tabIndex={0}
          style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '48px 24px 24px', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <Icon
              name="Gift"
              decorative
              size="large"
              style={{ color: 'var(--ld-semantic-color-icon-brand, #0053e2)', marginBottom: 12 }}
            />
            <Heading as="h2" size="large" UNSAFE_style={{ marginBottom: 8 }}>
              Your Community participation counts
            </Heading>
            <Body size="medium" color="subtle" as="p">
              Your previous Community activity is reflected in your lifetime points and Community Pass benefits.
            </Body>
          </div>

          <div style={{ background: 'var(--ld-semantic-color-surface-subtle, #f4f4f5)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <Caption color="subtle" as="p" UNSAFE_style={{ marginBottom: 2 }}>Lifetime points recognized</Caption>
            <Heading as="div" size="large" UNSAFE_style={{ marginBottom: 20 }}>{lifetimePoints.toLocaleString()}</Heading>

            {achievedMilestones.length > 0 && (
              <div style={{ marginBottom: nextBenefitLabel || pointsRemaining == null ? 20 : 0 }}>
                <Caption color="subtle" weight="alt" as="p" UNSAFE_style={{ marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Already available
                </Caption>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {achievedMilestones.map((m) => (
                    <div key={m.points} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon name="CheckCircleFill" decorative size="small" style={{ color: 'var(--ld-semantic-color-progress-fill-positive, #2a8703)' }} />
                      <Body size="medium">{capitalize(benefitLabelList(m.benefits))}</Body>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {nextMilestonePoints != null ? (
              <div>
                <Caption color="subtle" weight="alt" as="p" UNSAFE_style={{ marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Next
                </Caption>
                <Body size="medium" weight="alt" as="p" UNSAFE_style={{ marginBottom: 2 }}>
                  {nextMilestonePoints.toLocaleString()} points — {nextBenefitLabel}
                </Body>
                <Caption color="subtle" as="p">{pointsRemaining?.toLocaleString()} points remaining</Caption>
              </div>
            ) : (
              <Body size="medium" as="p" color="subtle">
                All current Community Pass milestones achieved. Lifetime points continue accumulating.
              </Body>
            )}
          </div>

          <div style={{ marginTop: 'auto' }}>
            <Button variant="primary" isFullWidth onClick={acknowledgeReconciliation}>
              Continue
            </Button>
          </div>
        </div>
      </div>
    </Page>
  );
}
