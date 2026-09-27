import * as React from 'react';
import { Card, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { ProgressIndicator } from '../../components/ProgressIndicator';
import { Tag } from '../../components/Tag';
import { Icon } from '../../components/Icons';
import { Heading, Body, Caption } from '../../components/Text';
import { capitalize } from '../../mmc/data';
import { BenefitDef } from '../../mmc/types';

interface CommunityPassSummaryCardProps {
  lifetimePoints: number;
  nextMilestonePoints: number | null;
  nextBenefits: BenefitDef[];
  onNavigate: () => void;
}

/**
 * Home's Community Pass summary card, generalized across every point band
 * (spec §27). Two truthful states:
 *  - A next operational milestone exists: the established 1B/1C
 *    progress-toward-next-benefit view, now rolling forward from 250 → 1,000
 *    → 3,000 rather than stopping after the first milestone (spec §8/§9).
 *  - No next milestone exists (3,000+): the motivational progress bar is
 *    retired — there is no destination to show a bar/countdown toward — and
 *    a restrained "all current milestones achieved" state takes its place
 *    (spec §7/§22).
 */
export function CommunityPassSummaryCard({ lifetimePoints, nextMilestonePoints, nextBenefits, onNavigate }: CommunityPassSummaryCardProps) {
  const nextBenefitLabel = nextBenefits.length ? capitalize(nextBenefits.map((b) => b.label).join(' + ')) : null;
  const pointsRemaining = nextMilestonePoints != null ? Math.max(nextMilestonePoints - lifetimePoints, 0) : 0;

  return (
    <Card>
      <CardContent>
        <Button
          variant="ghost"
          isFullWidth
          onClick={onNavigate}
          trailing={<Icon name="ChevronRight" decorative size="small" />}
          UNSAFE_style={{ justifyContent: 'space-between', padding: 0, marginBottom: 16 }}
        >
          <Body size="small" weight="alt" color="brand" UNSAFE_style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Community Pass
          </Body>
        </Button>

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
            <Heading as="div" size="small" UNSAFE_style={{ marginBottom: 4 }}>{nextBenefitLabel}</Heading>
            <Caption color="subtle" as="p">{lifetimePoints.toLocaleString()} lifetime points</Caption>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 12 }}>
              <Tag color="positive" variant="secondary" leading={<Icon name="CheckCircle" decorative size="small" />}>
                All current milestones achieved
              </Tag>
            </div>
            <Caption color="subtle" as="p">{lifetimePoints.toLocaleString()} lifetime points</Caption>
          </>
        )}
      </CardContent>
    </Card>
  );
}
