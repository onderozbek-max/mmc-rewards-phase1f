import * as React from 'react';
import { Page } from '../components/Page';
import { Heading } from '../components/Text';
import { WelcomeCard } from '../components/mmc/WelcomeCard';
import { CommunityPassSummaryCard } from '../components/mmc/CommunityPassSummaryCard';
import { UnlockedBenefitsSection } from '../components/mmc/UnlockedBenefitsSection';
import { TestingEligibilitySummaryCard } from '../components/mmc/TestingEligibilitySummaryCard';
import { ActivityCard } from '../components/mmc/ActivityCard';
import { BottomNavBar, NavTab } from '../components/mmc/BottomNavBar';
import { useMMC } from '../mmc/useMMCStore';
import { WAYS_TO_PROGRESS } from '../mmc/data';
import { Route } from '../mmc/types';

interface HomePageProps {
  onNavigate: (route: Route) => void;
  scrollToBenefitsOnMount?: boolean;
  onScrolledToBenefits?: () => void;
}

export function HomePage({ onNavigate, scrollToBenefitsOnMount, onScrolledToBenefits }: HomePageProps) {
  const {
    state,
    lifetimePoints,
    milestonesReached,
    nextMilestonePoints,
    nextBenefits,
    completedWaysToProgressIds,
    completeActivity,
  } = useMMC();

  // The achievement CTA ("Explore your benefits") and Community Pass's own
  // benefits shortcut both land here and ask for an immediate scroll to the
  // unlocked Community content modules — without this, the member would
  // land on Home's top and have to notice the new section on their own.
  // (This effect must run unconditionally, before the reconciliation-error
  // guard below, to satisfy the Rules of Hooks.)
  React.useEffect(() => {
    if (scrollToBenefitsOnMount) {
      document.getElementById('mmc-benefits')?.scrollIntoView({ behavior: 'auto', block: 'start' });
      onScrolledToBenefits?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToBenefitsOnMount]);

  // App.tsx never renders Home while reconciliationStatus === 'error'; guard
  // anyway (spec §16) rather than let a null total flow into arithmetic below.
  if (lifetimePoints == null) return null;

  // NEW members: their organic history sums to their total exactly, so an
  // exact count is truthful. EXISTING members: the visible history is a
  // small, non-summed sample (spec §28-29) — an exact count here would
  // misrepresent how much Community activity actually backs their points, so
  // the CTA is phrased without a number instead.
  const activitySummaryLabel =
    state.population === 'new'
      ? `${state.organicHistory.length + state.waysToProgressCompletions.length} activities completed`
      : 'View your activity';
  const contentUnlocked = milestonesReached.includes(250);
  const basicUnlocked = milestonesReached.includes(1000);
  const premiumUnlocked = milestonesReached.includes(3000);
  // "Open activities" only replaces "Ways to make progress" once no further
  // milestone is defined (3,000+ terminal state) — while a next milestone is
  // still active (250-999, 1,000-2,999) the motivational framing stays
  // (spec §9/§27).
  const activitiesHeading = nextMilestonePoints == null ? 'Open activities' : 'Ways to make progress';

  const handleTab = (tab: NavTab) => {
    if (tab === 'home') onNavigate('home');
    if (tab === 'account') onNavigate('profile');
    // scan / reorder / services are out of scope for this prototype — inert by design.
  };

  return (
    <Page title="Member's Mark Community" titleVisuallyHidden>
      <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', inset: 0 }}>
        <div role="region" aria-label="Home content" tabIndex={0} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '32px 20px 24px' }}>
          <Heading as="h2" size="large" UNSAFE_style={{ textAlign: 'center', marginBottom: 24 }}>
            Member's Mark Community
          </Heading>

          <div style={{ marginBottom: 20 }}>
            <WelcomeCard
              memberName={state.memberName}
              memberSinceLabel={state.memberSinceLabel}
              activitySummaryLabel={activitySummaryLabel}
              onViewActivities={() => onNavigate('profile')}
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <CommunityPassSummaryCard
              lifetimePoints={lifetimePoints}
              nextMilestonePoints={nextMilestonePoints}
              nextBenefits={nextBenefits}
              onNavigate={() => onNavigate('community-pass')}
            />
          </div>

          {contentUnlocked && (
            <div style={{ marginBottom: 32 }}>
              <UnlockedBenefitsSection />
            </div>
          )}

          {/* 1,000-2,999 band: basic-testing eligibility visible. 3,000+ band:
              basic AND premium both remain visible (spec §27). */}
          {(basicUnlocked || premiumUnlocked) && (
            <div style={{ marginBottom: 32 }}>
              <TestingEligibilitySummaryCard
                basicUnlocked={basicUnlocked}
                premiumUnlocked={premiumUnlocked}
                onView={() => onNavigate('product-testing')}
              />
            </div>
          )}

          <Heading as="h2" size="medium" UNSAFE_style={{ marginBottom: 16 }}>
            {activitiesHeading} ({WAYS_TO_PROGRESS.length})
          </Heading>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {WAYS_TO_PROGRESS.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isCompleted={completedWaysToProgressIds.has(activity.id)}
                onComplete={completeActivity}
              />
            ))}
          </div>
        </div>

        <BottomNavBar active="home" onChange={handleTab} />
      </div>
    </Page>
  );
}
