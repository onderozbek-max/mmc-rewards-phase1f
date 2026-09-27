import * as React from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icons';
import { Heading, Body, Caption } from '../../components/Text';
import { Divider } from '../../components/Divider';
import { PendingAchievement } from '../../mmc/types';
import { capitalize, benefitLabelList } from '../../mmc/data';

interface AchievementModalProps {
  achievement: PendingAchievement | null;
  onViewBenefit: () => void;
}

const EXPLANATION_BY_KIND: Record<string, string> = {
  content: 'Your Community contribution unlocked these benefits — explore them now.',
  'basic-testing':
    "You're now eligible to be considered for select Member's Mark product-testing opportunities. Selected participants receive the product to test and can keep it.",
  'premium-testing':
    "You're now eligible to be considered for select premium product-testing opportunities, including higher-value products. Selected participants receive the product to test and can keep it.",
};

const CTA_BY_KIND: Record<string, string> = {
  content: 'Explore your benefits',
  'basic-testing': 'Explore product testing',
  'premium-testing': 'Explore premium product testing',
};

/**
 * The milestone achievement moment, generalized across every currently
 * aligned milestone (spec §11-14) — the SAME one coherent completion-to-
 * achievement pattern verified in Phase 1D, now driven by whichever
 * milestone/benefit was just crossed rather than a single hard-coded 250
 * case. It carries the full causal hierarchy in one dialog:
 *   ACTIVITY RESULT  → "+30 points"
 *   RESULTING TOTAL  → "1,020 lifetime points"
 *   MILESTONE        → "1,000-point milestone reached"
 *   VALUE            → "Basic product-testing eligibility unlocked"
 *   EXPLANATION      → truthful eligibility-not-selection copy for testing tiers
 *   ACTION           → milestone-appropriate CTA, routed by App.tsx
 * Recognition stays restrained regardless of tier — one subtle check-mark
 * glyph, concise copy, no confetti/trophies/tier language.
 */
export function AchievementModal({ achievement, onViewBenefit }: AchievementModalProps) {
  if (!achievement) return null;

  const primaryKind = achievement.benefits[0]?.kind ?? 'content';
  const label = capitalize(benefitLabelList(achievement.benefits));
  const explanation = EXPLANATION_BY_KIND[primaryKind];
  const ctaLabel = CTA_BY_KIND[primaryKind];

  return (
    <Modal
      isOpen={!!achievement}
      title="Milestone reached"
      onClose={onViewBenefit}
      size="medium"
      actions={
        <Button variant="primary" isFullWidth onClick={onViewBenefit}>
          {ctaLabel}
        </Button>
      }
    >
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Caption color="subtle" as="p" UNSAFE_style={{ marginBottom: 4 }}>{achievement.activityTitle}</Caption>
        <Heading as="div" size="medium" UNSAFE_style={{ marginBottom: 2 }}>+{achievement.pointsEarned} points</Heading>
        <Body size="medium" as="p" color="subtle">{achievement.totalAfter.toLocaleString()} lifetime points</Body>
      </div>

      <div style={{ margin: '20px 0' }}><Divider /></div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12 }}>
        <Icon name="CheckCircleFill" decorative size="large" style={{ color: 'var(--ld-semantic-color-progress-fill-positive, #2a8703)' }} />
        <Caption color="subtle" weight="alt">{achievement.milestone.toLocaleString()}-point milestone reached</Caption>
        <Heading as="h2" size="medium">{label} unlocked</Heading>
        <Body size="medium" as="p" color="subtle">
          {explanation}
        </Body>
      </div>
    </Modal>
  );
}
