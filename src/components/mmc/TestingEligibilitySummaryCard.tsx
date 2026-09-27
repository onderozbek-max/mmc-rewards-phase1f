import * as React from 'react';
import { Card, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Tag } from '../../components/Tag';
import { Icon } from '../../components/Icons';
import { Heading, Body } from '../../components/Text';

interface TestingEligibilitySummaryCardProps {
  basicUnlocked: boolean;
  premiumUnlocked: boolean;
  onView: () => void;
}

/**
 * Compact Home-surface acknowledgement that testing eligibility is unlocked
 * (spec §27: "basic-testing eligibility visible" / "premium-testing
 * eligibility visible" for the 1,000-2,999 and 3,000+ bands) without
 * duplicating the full eligibility/opportunity detail that lives on the
 * Product Testing page. Home stays activity-centric, not a rewards
 * dashboard — this is a single, restrained entry point.
 */
export function TestingEligibilitySummaryCard({ basicUnlocked, premiumUnlocked, onView }: TestingEligibilitySummaryCardProps) {
  if (!basicUnlocked && !premiumUnlocked) return null;

  return (
    <Card>
      <CardContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Icon name="Box" decorative size="small" style={{ color: 'var(--ld-semantic-color-icon-brand, #0053e2)' }} />
          <Heading as="h3" size="small">Product testing</Heading>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {basicUnlocked && (
            <Tag color="positive" variant="secondary" leading={<Icon name="CheckCircle" decorative size="small" />}>
              Basic eligibility
            </Tag>
          )}
          {premiumUnlocked && (
            <Tag color="positive" variant="secondary" leading={<Icon name="CheckCircle" decorative size="small" />}>
              Premium eligibility
            </Tag>
          )}
        </div>

        <Body size="medium" color="subtle" as="p" UNSAFE_style={{ marginBottom: 16 }}>
          You're eligible to be considered for select product-testing opportunities. Selection is never guaranteed.
        </Body>

        <Button variant="secondary" isFullWidth onClick={onView}>
          View product testing
        </Button>
      </CardContent>
    </Card>
  );
}
