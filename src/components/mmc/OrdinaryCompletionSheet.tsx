import * as React from 'react';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { Heading, Body } from '../../components/Text';
import { PendingOrdinary } from '../../mmc/types';

interface OrdinaryCompletionSheetProps {
  completion: PendingOrdinary | null;
  onClose: () => void;
}

/**
 * Ordinary (non-milestone) 1C completion feedback, generalized across every
 * point band (spec §10). Deliberately lighter weight than AchievementModal —
 * a quick bottom sheet, no unlock language, no milestone graphic.
 *
 * The "distance to next benefit" clause is driven entirely by
 * `nextMilestonePoints` / `nextBenefitLabel`, which are null once every
 * currently aligned milestone has been reached (spec §8/§10) — at 3,000+ the
 * sheet correctly stops inventing a next destination, matching the 3,530
 * example exactly (no distance clause at all).
 */
export function OrdinaryCompletionSheet({ completion, onClose }: OrdinaryCompletionSheetProps) {
  if (!completion) return null;
  const remaining = completion.nextMilestonePoints != null ? completion.nextMilestonePoints - completion.totalAfter : null;

  return (
    <BottomSheet
      isOpen={!!completion}
      title="Activity completed"
      onClose={onClose}
      actions={
        <Button variant="primary" isFullWidth onClick={onClose}>
          Done
        </Button>
      }
    >
      <Heading as="div" size="medium" UNSAFE_style={{ marginBottom: 8 }}>
        {completion.pointsEarned > 0 ? `+${completion.pointsEarned} points` : 'Activity completed'}
      </Heading>
      <Body size="medium" as="p" color="subtle">
        {completion.totalAfter.toLocaleString()} lifetime points
        {remaining != null && completion.nextBenefitLabel && ` • ${remaining.toLocaleString()} points until ${completion.nextBenefitLabel}`}
      </Body>
    </BottomSheet>
  );
}
