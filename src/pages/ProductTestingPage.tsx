import * as React from 'react';
import { Page } from '../components/Page';
import { TopBar } from '../components/mmc/TopBar';
import { BottomNavBar, NavTab } from '../components/mmc/BottomNavBar';
import { TestingBenefitCard } from '../components/mmc/TestingBenefitCard';
import { Heading, Body } from '../components/Text';
import { useMMC } from '../mmc/useMMCStore';
import { Route } from '../mmc/types';

interface ProductTestingPageProps {
  onNavigate: (route: Route) => void;
  scrollToTierOnMount?: 'basic' | 'premium' | null;
  onScrolledToTier?: () => void;
}

/**
 * Product-testing eligibility surface (spec §16). Shows a card per tier the
 * member has actually unlocked — never a placeholder for a tier not yet
 * reached (spec §5 truthfulness rule). Reached from Community Pass, from
 * Home's compact testing summary, and directly from the 1,000/3,000
 * achievement moment's CTA.
 */
export function ProductTestingPage({ onNavigate, scrollToTierOnMount, onScrolledToTier }: ProductTestingPageProps) {
  const { milestonesReached, testingOpportunities } = useMMC();
  const basicUnlocked = milestonesReached.includes(1000);
  const premiumUnlocked = milestonesReached.includes(3000);

  React.useEffect(() => {
    if (scrollToTierOnMount) {
      document.getElementById(`mmc-testing-${scrollToTierOnMount}`)?.scrollIntoView({ behavior: 'auto', block: 'start' });
      onScrolledToTier?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollToTierOnMount]);

  const handleTab = (tab: NavTab) => {
    if (tab === 'home') onNavigate('home');
    if (tab === 'account') onNavigate('profile');
  };

  return (
    <Page title="Product Testing" titleVisuallyHidden>
      <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', inset: 0 }}>
        <TopBar label="Product Testing" onBack={() => onNavigate('community-pass')} />

        <div role="region" aria-label="Product Testing content" tabIndex={0} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px' }}>
          <Heading as="h2" size="large" UNSAFE_style={{ marginBottom: 8 }}>Product Testing</Heading>
          <Body size="medium" color="subtle" as="p" UNSAFE_style={{ marginBottom: 20 }}>
            Milestones unlock eligibility to be considered for select product-testing opportunities. Eligibility does
            not guarantee selection.
          </Body>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {basicUnlocked && <TestingBenefitCard tier="basic" opportunityAvailable={testingOpportunities.basic} />}
            {premiumUnlocked && <TestingBenefitCard tier="premium" opportunityAvailable={testingOpportunities.premium} />}
            {!basicUnlocked && !premiumUnlocked && (
              <Body size="medium" color="subtle" as="p">
                Reach 1,000 lifetime points to unlock basic product-testing eligibility.
              </Body>
            )}
          </div>
        </div>

        <BottomNavBar active="home" onChange={handleTab} />
      </div>
    </Page>
  );
}
