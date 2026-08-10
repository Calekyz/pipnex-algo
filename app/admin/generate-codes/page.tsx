'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function GenerateCodesPage() {
  const [plan, setPlan] = useState('PRO');
  const [duration, setDuration] = useState(30);
  const [quantity, setQuantity] = useState(1);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/generate-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, duration, quantity }),
      });

      const data = await res.json();
      if (res.ok) {
        setGeneratedCodes(data.codes);
        setMessage(`✅ Generated ${data.codes.length} codes successfully!`);
      } else {
        setMessage('❌ ' + data.error);
      }
    } catch (err) {
      setMessage('❌ Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyCodes = () => {
    navigator.clipboard.writeText(generatedCodes.join('\n'));
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="container mx-auto max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Generate Activation Codes</h1>
          <a href="/admin" className="text-blue-400 hover:text-blue-300">← Back to Admin</a>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Create New Codes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Plan</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="PRO">Pro ($30 - ½ month)</option>
                <option value="GOLD">Gold ($99.99 - 1 month)</option>
                <option value="PLATINUM">Platinum ($299.99 - 1 month)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Duration (days)</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="bg-gray-700 border-gray-600 text-white"
                min={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="bg-gray-700 border-gray-600 text-white"
                min={1}
                max={100}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              {loading ? 'Generating...' : 'Generate Codes'}
            </Button>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${message.includes('✅') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {message}
              </div>
            )}

            {generatedCodes.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">{generatedCodes.length} codes generated</span>
                  <Button variant="outline" size="sm" onClick={copyCodes} className="text-white border-gray-600">
                    📋 Copy All
                  </Button>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {generatedCodes.map((code, i) => (
                    <div key={i} className="text-white font-mono text-sm py-1 border-b border-gray-700 last:border-0">
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
