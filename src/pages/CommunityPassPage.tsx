import * as React from 'react';
import { Page } from '../components/Page';
import { TopBar } from '../components/mmc/TopBar';
import { BottomNavBar, NavTab } from '../components/mmc/BottomNavBar';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { Tag } from '../components/Tag';
import { Icon } from '../components/Icons';
import { Button } from '../components/Button';
import { Heading, Body, Caption } from '../components/Text';
import { useMMC } from '../mmc/useMMCStore';
import { MILESTONES, capitalize, benefitLabelList } from '../mmc/data';
import { Route } from '../mmc/types';

interface CommunityPassPageProps {
  onNavigate: (route: Route) => void;
  onExploreBenefit: (kind: 'content' | 'basic-testing' | 'premium-testing') => void;
}

/**
 * Community Pass — the primary place for the complete lifetime journey
 * (spec §28). Shows current lifetime points, the active progress toward
 * whichever milestone is next (or the terminal/current state once none
 * remain), and a single milestone-journey timeline that carries both
 * "achieved" and "benefit" information per milestone — deliberately not
 * duplicated into a second "cumulative benefits" list, to avoid repeating
 * the same unlocked/eligible language multiple times for the same benefit.
 */
export function CommunityPassPage({ onNavigate, onExploreBenefit }: CommunityPassPageProps) {
  const { lifetimePoints, milestonesReached, nextMilestonePoints, nextBenefits } = useMMC();
  // App.tsx never renders Community Pass while reconciliationStatus ===
  // 'error'; guard anyway (spec §16) rather than let a null total flow into
  // arithmetic below.
  if (lifetimePoints == null) return null;
  const pointsRemaining = nextMilestonePoints != null ? Math.max(nextMilestonePoints - lifetimePoints, 0) : 0;
  const nextBenefitLabel = nextBenefits.length ? capitalize(benefitLabelList(nextBenefits)) : null;

  const handleTab = (tab: NavTab) => {
    if (tab === 'home') onNavigate('home');
    if (tab === 'account') onNavigate('profile');
  };

  return (
    <Page title="Community Pass" titleVisuallyHidden>
      <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', inset: 0 }}>
        <TopBar label="Community Pass" onBack={() => onNavigate('home')} />

        <div role="region" aria-label="Community Pass content" tabIndex={0} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px' }}>
          <Heading as="h2" size="large" UNSAFE_style={{ marginBottom: 8 }}>Community Pass</Heading>
          <Body size="medium" color="subtle" as="p" UNSAFE_style={{ marginBottom: 20 }}>
            Take part in Community activities and earn points. Your lifetime points move you toward benefit milestones.
          </Body>

          <div style={{ background: 'var(--ld-semantic-color-surface-subtle, #f4f4f5)', borderRadius: 16, padding: 20, marginBottom: 32 }}>
            <Heading as="div" size="large" UNSAFE_style={{ marginBottom: 2 }}>{lifetimePoints.toLocaleString()}</Heading>
            <Caption color="subtle" as="p" UNSAFE_style={{ marginBottom: 16 }}>lifetime points</Caption>

            {nextMilestonePoints != null ? (
              <>
                <ProgressIndicator
                  value={lifetimePoints}
                  min={0}
                  max={nextMilestonePoints}
                  label="toward the next benefit"
                  valueLabel={`${lifetimePoints.toLocaleString()} of ${nextMilestonePoints.toLocaleString()} points`}
                />
                <Body size="medium" as="p" UNSAFE_style={{ margin: '12px 0' }}>
                  {pointsRemaining.toLocaleString()} points to your next benefit
                </Body>
                <Body size="medium" weight="alt" as="p">
                  Next benefit: {nextBenefitLabel}
                </Body>
                <div style={{ marginTop: 20 }}>
                  <Button variant="primary" isFullWidth onClick={() => onNavigate('home')}>
                    Explore activities
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Tag color="positive" variant="secondary" leading={<Icon name="CheckCircleFill" decorative size="small" />}>
                  All current Community Pass milestones achieved
                </Tag>
                <Body size="medium" as="p" color="subtle" UNSAFE_style={{ margin: '12px 0 0' }}>
                  Lifetime points continue accumulating.
                </Body>
                <div style={{ marginTop: 20 }}>
                  <Button variant="primary" isFullWidth onClick={() => onNavigate('home')}>
                    Open activities
                  </Button>
                </div>
              </>
            )}
          </div>

          <Heading as="h2" size="medium" UNSAFE_style={{ marginBottom: 8 }}>Your benefit journey</Heading>
          <Body size="medium" color="subtle" as="p" UNSAFE_style={{ marginBottom: 20 }}>
            As your lifetime points grow, more benefits become available. Points never reset, and earlier benefits
            never go away.
          </Body>

          <div>
            {MILESTONES.map((milestone, index) => {
              const isUnlocked = milestonesReached.includes(milestone.points);
              const isNext = !isUnlocked && milestone.points === nextMilestonePoints;
              const isLast = index === MILESTONES.length - 1;
              const label = capitalize(benefitLabelList(milestone.benefits));
              const kind = milestone.benefits[0]?.kind;

              return (
                <div key={milestone.points} style={{ display: 'flex', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Icon
                      name={isUnlocked ? 'CheckCircleFill' : 'CheckCircle'}
                      decorative
                      size="medium"
                      style={{ color: isUnlocked ? 'var(--ld-semantic-color-progress-fill-positive, #2a8703)' : 'var(--ld-semantic-color-progress-fill-subtle, #e3e4e5)' }}
                    />
                    {!isLast && <div style={{ width: 2, flex: 1, minHeight: 40, background: 'var(--ld-semantic-color-border-subtle, #e3e4e5)', margin: '4px 0' }} />}
                  </div>
                  <div style={{ paddingBottom: 32, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Heading as="div" size="small">{milestone.points.toLocaleString()} points</Heading>
                      {isUnlocked && <Tag color="positive" size="small">✓ Unlocked</Tag>}
                      {isNext && <Tag color="info" variant="tertiary" size="small">Next benefit</Tag>}
                    </div>
                    <Body size="medium" color="subtle" UNSAFE_style={{ marginBottom: isUnlocked && kind ? 8 : 0 }}>{label}</Body>
                    {isUnlocked && kind && (
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => onExploreBenefit(kind)}
                        trailing={<Icon name="ChevronRight" decorative size="small" />}
                        UNSAFE_style={{ padding: 0 }}
                      >
                        View benefit
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <BottomNavBar active="home" onChange={handleTab} />
      </div>
    </Page>
  );
}
