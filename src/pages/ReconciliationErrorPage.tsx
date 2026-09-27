import * as React from 'react';
import { Page } from '../components/Page';
import { Icon } from '../components/Icons';
import { Heading, Body } from '../components/Text';

/**
 * Restrained safe-failure state (spec §25-26) for an existing member whose
 * historical points ledger could not be confirmed at reconciliation time.
 * Deliberately does NOT: show 0 points, guess/estimate a total, ask the
 * member to re-earn anything, or offer a "continue anyway" escape hatch —
 * doing any of those would let the member walk away believing their
 * Community history was erased (spec §26/§38 PAIR 3), which is the one
 * outcome this screen exists to prevent. There is nothing to acknowledge
 * here, so — unlike the orientation screen — there is no Continue action;
 * the member simply isn't shown a number until one can be trusted.
 */
export function ReconciliationErrorPage() {
  return (
    <Page title="We're updating your Community Pass" titleVisuallyHidden>
      <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', inset: 0 }}>
        <div
          role="region"
          aria-label="Community Pass update in progress"
          tabIndex={0}
          style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '48px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}
        >
          <Icon
            name="Clock"
            decorative
            size="large"
            style={{ color: 'var(--ld-semantic-color-icon-subtle, #74767c)', marginBottom: 16, alignSelf: 'center' }}
          />
          <Heading as="h2" size="large" UNSAFE_style={{ marginBottom: 12 }}>
            We're updating your Community Pass
          </Heading>
          <Body size="medium" as="p" color="subtle" UNSAFE_style={{ marginBottom: 8 }}>
            We couldn't confirm your complete Community activity history right now.
          </Body>
          <Body size="medium" as="p" UNSAFE_style={{ marginBottom: 8 }}>
            Your Community participation isn't lost.
          </Body>
          <Body size="medium" as="p" color="subtle">
            Please check back later.
          </Body>
        </div>
      </div>
    </Page>
  );
}
