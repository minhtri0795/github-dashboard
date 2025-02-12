import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
}

export function StatsCard({ title, value, description }: StatsCardProps) {
  return (
    <Card className="bg-card-DEFAULT">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium mb-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-semibold text-gray">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
