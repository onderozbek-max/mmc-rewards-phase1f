import * as React from 'react';
import { Card, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Tag } from '../../components/Tag';
import { Icon } from '../../components/Icons';
import { Heading, Body, Caption } from '../../components/Text';
import { Divider } from '../../components/Divider';

export type TestingTier = 'basic' | 'premium';

interface TestingBenefitCardProps {
  tier: TestingTier;
  opportunityAvailable: boolean;
}

const COPY: Record<
  TestingTier,
  {
    icon: string;
    sectionLabel: string;
    eligibilityBody: string;
    noOpportunityBody: string;
    noOpportunityHint: string;
    opportunityLabel: string;
    opportunityHeadline: string;
    ctaLabel: string;
    disclosure: string;
  }
> = {
  basic: {
    icon: 'Box',
    sectionLabel: 'Basic product testing',
    eligibilityBody: "You're eligible to be considered for select everyday product-testing opportunities.",
    noOpportunityBody: 'No testing opportunities are available right now.',
    noOpportunityHint: 'When an opportunity matches your profile and research needs, it may appear here in Community.',
    opportunityLabel: 'Product testing opportunity',
    opportunityHeadline: 'Everyday product test',
    ctaLabel: 'View opportunity',
    disclosure:
      'Additional eligibility and matching criteria may apply. Being shown this opportunity does not guarantee selection. Selected participants receive the product to test and can keep it.',
  },
  premium: {
    icon: 'Medal',
    sectionLabel: 'Premium product testing',
    eligibilityBody:
      "You're eligible to be considered for select premium product-testing opportunities, including higher-value products.",
    noOpportunityBody: 'No premium testing opportunities are available right now.',
    noOpportunityHint: 'New opportunities may appear as they become available and match relevant research needs.',
    opportunityLabel: 'Premium product testing opportunity',
    opportunityHeadline: 'Higher-value product test',
    ctaLabel: 'View opportunity',
    disclosure:
      'Additional eligibility and matching criteria may apply. Being shown this opportunity does not guarantee selection. Selected participants receive the product to test and can keep it.',
  },
};

/**
 * Product-testing eligibility benefit surface (spec §16-20). Deliberately
 * NOT a full testing/research platform — it answers exactly five questions:
 * am I eligible, for which tier, what does eligibility mean, is anything
 * available right now, and what happens if I'm selected. Eligibility and
 * opportunity supply are independent (spec §15) — this component always
 * renders the eligible state (it's only mounted for milestones the member
 * has actually reached) and separately renders whichever
 * opportunity-availability state the prototype's demo control is set to.
 */
export function TestingBenefitCard({ tier, opportunityAvailable }: TestingBenefitCardProps) {
  const copy = COPY[tier];
  const [expanded, setExpanded] = React.useState(false);
  const sectionId = `mmc-testing-${tier}`;

  return (
    <div id={sectionId} style={{ scrollMarginTop: 24 }}>
      <Card>
        <CardContent>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Icon name={copy.icon} decorative size="small" style={{ color: 'var(--ld-semantic-color-icon-brand, #0053e2)' }} />
            <Heading as="h3" size="small">{copy.sectionLabel}</Heading>
          </div>

          <div style={{ marginBottom: 12 }}>
            <Tag color="positive" variant="secondary" leading={<Icon name="CheckCircleFill" decorative size="small" />}>
              Eligible
            </Tag>
          </div>

          <Body size="medium" as="p" color="subtle" UNSAFE_style={{ marginBottom: 16 }}>
            {copy.eligibilityBody} Selected participants receive the product to test and can keep it.
          </Body>

          <div style={{ margin: '16px 0' }}><Divider /></div>

          {opportunityAvailable ? (
            <div>
              <Caption color="subtle" weight="alt" as="p" UNSAFE_style={{ marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {copy.opportunityLabel}
              </Caption>
              <Body size="medium" weight="alt" as="p" UNSAFE_style={{ marginBottom: 12 }}>
                {copy.opportunityHeadline}
              </Body>
              <Button variant="secondary" size="small" onClick={() => setExpanded((v) => !v)}>
                {copy.ctaLabel}
              </Button>
              {expanded && (
                <Body size="small" color="subtle" as="p" UNSAFE_style={{ marginTop: 12 }}>
                  {copy.disclosure}
                </Body>
              )}
            </div>
          ) : (
            <div>
              <Body size="medium" as="p" UNSAFE_style={{ marginBottom: 4 }}>{copy.noOpportunityBody}</Body>
              <Caption color="subtle" as="p">{copy.noOpportunityHint}</Caption>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
