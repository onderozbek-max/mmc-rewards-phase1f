import * as React from 'react';
import { useInitializeTheming } from './utils/Theming';
import { A11yAnnouncementProvider } from './components/A11yAnnouncement';
import { A11yDevAssertions } from './components/A11yDevAssertions';

import { MMCProvider, useMMC } from './mmc/useMMCStore';
import { Route } from './mmc/types';
import { StakeholderShell } from './components/mmc/StakeholderShell';
import { DemoControlsPanel } from './components/mmc/DemoControlsPanel';
import { AchievementModal } from './components/mmc/AchievementModal';
import { OrdinaryCompletionSheet } from './components/mmc/OrdinaryCompletionSheet';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { CommunityPassPage } from './pages/CommunityPassPage';
import { ProductTestingPage } from './pages/ProductTestingPage';
import { ReconciliationOrientationPage } from './pages/ReconciliationOrientationPage';
import { ReconciliationErrorPage } from './pages/ReconciliationErrorPage';

function MMCApp() {
  const [route, setRoute] = React.useState<Route>('home');
  const [scrollToBenefits, setScrollToBenefits] = React.useState(false);
  const [testingScrollTarget, setTestingScrollTarget] = React.useState<'basic' | 'premium' | null>(null);
  const {
    pendingAchievement,
    pendingOrdinary,
    dismissAchievement,
    dismissOrdinary,
    testingOpportunities,
    setTestingOpportunity,
    currentScenarioId,
    resetToScenario,
    reconciliationStatus,
    reconciliationAcknowledged,
  } = useMMC();

  // The real destination for each unlocked benefit kind — never a dead end,
  // never just closing a modal (spec §12-14/§21). Community content lives on
  // Home; both testing tiers live on the Product Testing page.
  const goToContentBenefits = () => {
    setRoute('home');
    setScrollToBenefits(true);
  };

  const goToTestingBenefit = (tier: 'basic' | 'premium') => {
    setRoute('product-testing');
    setTestingScrollTarget(tier);
  };

  const handleExploreBenefit = (kind: 'content' | 'basic-testing' | 'premium-testing') => {
    if (kind === 'content') goToContentBenefits();
    else goToTestingBenefit(kind === 'basic-testing' ? 'basic' : 'premium');
  };

  const handleViewBenefit = () => {
    const kind = pendingAchievement?.benefits[0]?.kind ?? 'content';
    dismissAchievement();
    handleExploreBenefit(kind);
  };

  // Reconciliation gate (spec §7/§14/§25) — takes precedence over normal
  // routing entirely. Neither branch depends on `route`, so whatever the
  // member was navigating to is preserved underneath and resumes exactly
  // where it left off once the gate clears (error resolves, or orientation
  // is acknowledged) — no route reset, no lost place.
  let page: React.ReactNode;
  if (reconciliationStatus === 'error') {
    page = <ReconciliationErrorPage />;
  } else if (reconciliationStatus === 'ok' && !reconciliationAcknowledged) {
    page = <ReconciliationOrientationPage />;
  } else if (route === 'profile') {
    page = <ProfilePage onNavigate={setRoute} />;
  } else if (route === 'community-pass') {
    page = <CommunityPassPage onNavigate={setRoute} onExploreBenefit={handleExploreBenefit} />;
  } else if (route === 'product-testing') {
    page = (
      <ProductTestingPage
        onNavigate={setRoute}
        scrollToTierOnMount={testingScrollTarget}
        onScrolledToTier={() => setTestingScrollTarget(null)}
      />
    );
  } else {
    page = (
      <HomePage
        onNavigate={setRoute}
        scrollToBenefitsOnMount={scrollToBenefits}
        onScrolledToBenefits={() => setScrollToBenefits(false)}
      />
    );
  }

  return (
    <StakeholderShell>
      <div style={{ position: 'relative', minHeight: '100%' }}>
        <DemoControlsPanel
          currentScenarioId={currentScenarioId}
          onSelectScenario={resetToScenario}
          testingOpportunities={testingOpportunities}
          onSetTestingOpportunity={setTestingOpportunity}
        />
        {page}
        <AchievementModal achievement={pendingAchievement} onViewBenefit={handleViewBenefit} />
        <OrdinaryCompletionSheet completion={pendingOrdinary} onClose={dismissOrdinary} />
      </div>
    </StakeholderShell>
  );
}

export default function App() {
  // ── Theme ─────────────────────────────────────────────────────
  // Member's Mark Community is a Sam's Club private-label experience.
  useInitializeTheming("Member's Mark", ["Member's Mark"] as const);

  return (
    <A11yAnnouncementProvider>
      <A11yDevAssertions />
      <MMCProvider>
        <MMCApp />
      </MMCProvider>
    </A11yAnnouncementProvider>
  );
}
