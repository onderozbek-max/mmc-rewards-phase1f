import * as React from 'react';
import { Card, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Tag } from '../../components/Tag';
import { Icon } from '../../components/Icons';
import { Heading, Body, Caption } from '../../components/Text';
import { ActivityDef } from '../../mmc/types';

interface ActivityCardProps {
  activity: ActivityDef;
  isCompleted: boolean;
  onComplete: (activityId: string) => void;
}

export function ActivityCard({ activity, isCompleted, onComplete }: ActivityCardProps) {
  const metaLabel = activity.points > 0 ? `${activity.points} points • ${activity.endDateLabel}` : activity.endDateLabel;

  return (
    <Card>
      <CardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <Heading as="h3" size="small">{activity.title}</Heading>
          </div>
          <Icon name="Heart" decorative size="medium" />
        </div>
        <Body size="medium" color="subtle" as="p">{activity.description}</Body>
        <Caption color="subtle" as="p" UNSAFE_style={{ marginTop: 4 }}>{metaLabel}</Caption>

        <div style={{ borderTop: '1px solid var(--ld-semantic-color-border-subtle, #e3e4e5)', margin: '16px 0 0', paddingTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          {isCompleted ? (
            <Tag color="positive" variant="secondary" leading={<Icon name="CheckCircle" decorative size="small" />}>
              Completed
            </Tag>
          ) : (
            <Button variant="secondary" size="small" onClick={() => onComplete(activity.id)}>
              Complete activity
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
