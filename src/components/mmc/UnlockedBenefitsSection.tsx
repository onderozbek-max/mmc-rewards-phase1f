import * as React from 'react';
import { Card, CardContent } from '../../components/Card';
import { Icon } from '../../components/Icons';
import { Heading, Body, Caption } from '../../components/Text';
import { Divider } from '../../components/Divider';
import { BenefitContentItem } from '../../mmc/types';
import { WHATS_NEW_ITEMS, MEMBER_FAVORITES_ITEMS } from '../../mmc/data';

/**
 * The actual, real content of the unlocked 250-point Community content
 * benefit — rendered only once the 250-point milestone has been reached
 * (Home is the destination the achievement CTA routes to; see App.tsx's
 * `goToContentBenefits`). Two named modules, each with concrete Community
 * content, so the benefit is genuinely accessible and discoverable rather
 * than a "Benefit unlocked" label with nothing behind it.
 */
export function UnlockedBenefitsSection() {
  return (
    <div id="mmc-benefits" style={{ scrollMarginTop: 24 }}>
      <Card>
        <CardContent>
          <BenefitModule
            icon="Gift"
            title="What's New"
            intro="Fresh Community opportunities, unlocked for you."
            items={WHATS_NEW_ITEMS}
          />

          <div style={{ margin: '20px 0' }}><Divider /></div>

          <BenefitModule
            icon="Heart"
            title="Member Favorites"
            intro="What the Community is engaging with most."
            items={MEMBER_FAVORITES_ITEMS}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function BenefitModule({
  icon,
  title,
  intro,
  items,
}: {
  icon: string;
  title: string;
  intro: string;
  items: BenefitContentItem[];
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Icon name={icon} decorative size="small" style={{ color: 'var(--ld-semantic-color-icon-brand, #0053e2)' }} />
        <Heading as="h3" size="small">{title}</Heading>
      </div>
      <Body size="medium" color="subtle" as="p" UNSAFE_style={{ marginBottom: 12 }}>{intro}</Body>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item) => (
          <div key={item.title}>
            <Body size="medium" weight="alt" as="p" UNSAFE_style={{ marginBottom: 2 }}>{item.title}</Body>
            <Caption color="subtle" as="p">{item.description}</Caption>
          </div>
        ))}
      </div>
    </div>
  );
}
