import * as React from 'react';
import { Page } from '../components/Page';
import { TopBar } from '../components/mmc/TopBar';
import { BottomNavBar, NavTab } from '../components/mmc/BottomNavBar';
import { Icon } from '../components/Icons';
import { Display, Heading, Body, Caption } from '../components/Text';
import { Divider } from '../components/Divider';
import { Button } from '../components/Button';
import { useMMC } from '../mmc/useMMCStore';
import { findActivity } from '../mmc/data';
import { Route } from '../mmc/types';

interface ProfilePageProps {
  onNavigate: (route: Route) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { state, lifetimePoints } = useMMC();

  // App.tsx never renders Profile while reconciliationStatus === 'error';
  // guard anyway (spec §16) rather than render a page around an unknown total.
  if (lifetimePoints == null) return null;

  const completedFromWays = [...state.waysToProgressCompletions].reverse().map((c) => {
    const activity = findActivity(c.activityId);
    return { title: activity?.title ?? c.activityId, points: activity?.points ?? 0, dateLabel: c.dateLabel };
  });
  // NEW members: organicHistory sums to their total exactly, so this list IS
  // their complete history. EXISTING members: priorCommunityHistorySample is
  // a small, credible, NON-summed excerpt (spec §28-29) — Profile stays
  // simple and never claims this excerpt is the complete source of their
  // lifetime points (spec §29).
  const isExisting = state.population === 'existing';
  const historySample = isExisting ? state.priorCommunityHistorySample : state.organicHistory;
  const completedHistory = [...historySample].reverse();
  const allCompleted = [...completedFromWays, ...completedHistory];
  const activityHeading = isExisting ? 'Recent activity' : `Completed Activities (${allCompleted.length})`;

  const handleTab = (tab: NavTab) => {
    if (tab === 'home') onNavigate('home');
    if (tab === 'account') onNavigate('profile');
  };

  return (
    <Page title="Profile" titleVisuallyHidden>
      <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', inset: 0 }}>
        <TopBar label="Profile" onBack={() => onNavigate('home')} />

        <div role="region" aria-label="Profile content" tabIndex={0} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div
              aria-hidden
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--ld-semantic-color-fill-brand-bold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name="User" decorative size="medium" style={{ color: '#fff' }} />
            </div>
            <div>
              <Display as="span" size="small" UNSAFE_style={{ display: 'block' }}>{state.memberName}</Display>
              <Caption color="subtle">In the community since {state.memberSinceLabel}</Caption>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
            <Body size="medium">Lifetime points</Body>
            <Heading as="span" size="small">{lifetimePoints.toLocaleString()}</Heading>
          </div>
          <Divider />
          <Button
            variant="ghost"
            isFullWidth
            onClick={() => onNavigate('community-pass')}
            trailing={<Icon name="ChevronRight" decorative size="small" />}
            UNSAFE_style={{ justifyContent: 'space-between', padding: '12px 0' }}
          >
            <Body size="medium">Community Pass</Body>
          </Button>
          <Divider />

          <Heading as="h2" size="medium" UNSAFE_style={{ margin: '24px 0 8px' }}>
            {activityHeading}
          </Heading>
          {isExisting && (
            <Caption color="subtle" as="p" UNSAFE_style={{ marginBottom: 16 }}>
              Your full Community participation is reflected in your lifetime points total above.
            </Caption>
          )}

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {allCompleted.map((item, index) => (
              <React.Fragment key={`${item.title}-${item.dateLabel}-${index}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '14px 0', gap: 12 }}>
                  <div>
                    <Body size="medium" as="p" UNSAFE_style={{ marginBottom: 4 }}>{item.title}</Body>
                    <Caption color="subtle">{item.dateLabel}</Caption>
                  </div>
                  <Body size="medium" color={item.points > 0 ? 'positiveBold' : 'subtle'} UNSAFE_style={{ whiteSpace: 'nowrap' }}>
                    {item.points > 0 ? `+${item.points} pts` : 'No points'}
                  </Body>
                </div>
                {index < allCompleted.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <BottomNavBar active="account" onChange={handleTab} />
      </div>
    </Page>
  );
}
