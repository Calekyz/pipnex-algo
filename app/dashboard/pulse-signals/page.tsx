import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Coming Soon</h1>
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <div className="text-6xl mb-4">🚧</div>
          <p className="text-lg font-medium">This feature is under development</p>
          <p className="text-sm">Check back soon for updates!</p>
        </CardContent>
      </Card>
    </div>
  );
}
