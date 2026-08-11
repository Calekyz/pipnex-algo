'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Loader2, Image as ImageIcon, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface AnalysisResult {
  pattern: string;
  trend: string;
  support: string;
  resistance: string;
  entry: string;
  stopLoss: string;
  takeProfit: string;
  confidence: number;
  summary: string;
  recommendation: string;
}

export default function UploadChartPage() {
  const { user } = useUser();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [symbol, setSymbol] = useState('EUR/USD');
  const [timeframe, setTimeframe] = useState('1h');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      setResult(null);
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select a chart image first.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('symbol', symbol);
    formData.append('timeframe', timeframe);

    try {
      const res = await fetch('/api/analyze-chart', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Upload Chart</h1>
        <p className="text-gray-500 text-sm">
          Upload a screenshot of a trading chart for AI-powered analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload size={20} /> Upload Chart Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                selectedFile
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Chart preview"
                    className="max-h-60 mx-auto rounded-lg object-contain"
                  />
                  <button
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <ImageIcon size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">Drag & drop your chart image here, or click to browse</p>
                  <p className="text-xs text-gray-400 mt-1">Supports PNG, JPG, WebP</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="chart-upload"
              />
              <label
                htmlFor="chart-upload"
                className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition"
              >
                {selectedFile ? 'Change Image' : 'Select Image'}
              </label>
            </div>

            {/* Symbol & Timeframe */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="EUR/USD">EUR/USD</option>
                  <option value="GBP/USD">GBP/USD</option>
                  <option value="USD/JPY">USD/JPY</option>
                  <option value="AUD/USD">AUD/USD</option>
                  <option value="USD/CAD">USD/CAD</option>
                  <option value="XAU/USD">Gold (XAU/USD)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="1m">1 Minute</option>
                  <option value="5m">5 Minutes</option>
                  <option value="15m">15 Minutes</option>
                  <option value="1h">1 Hour</option>
                  <option value="4h">4 Hours</option>
                  <option value="1d">1 Day</option>
                </select>
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!selectedFile || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 rounded-lg"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" /> Analyzing Chart...
                </>
              ) : (
                '🔍 Analyze Chart'
              )}
            </Button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity size={20} /> Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <Loader2 size={40} className="animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-500">Analyzing your chart pattern...</p>
                <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-500">Pattern</p>
                    <p className="font-bold text-blue-700">{result.pattern}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    result.trend === 'Uptrend' ? 'bg-green-50' :
                    result.trend === 'Downtrend' ? 'bg-red-50' :
                    'bg-yellow-50'
                  }`}>
                    <p className="text-xs text-gray-500">Trend</p>
                    <p className={`font-bold ${
                      result.trend === 'Uptrend' ? 'text-green-600' :
                      result.trend === 'Downtrend' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {result.trend}
                    </p>
                  </div>
                </div>

                {/* Levels */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-500">Support</p>
                    <p className="font-bold text-blue-700">{result.support}</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-xs text-gray-500">Resistance</p>
                    <p className="font-bold text-red-600">{result.resistance}</p>
                  </div>
                </div>

                {/* Entry, SL, TP */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500">Entry</p>
                    <p className="font-bold text-green-700">{result.entry}</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500">Stop Loss</p>
                    <p className="font-bold text-red-600">{result.stopLoss}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500">Take Profit</p>
                    <p className="font-bold text-blue-700">{result.takeProfit}</p>
                  </div>
                </div>

                {/* Confidence */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm text-gray-500">Confidence</p>
                    <p className={`font-bold ${
                      result.confidence >= 70 ? 'text-green-600' :
                      result.confidence >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {result.confidence}%
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        result.confidence >= 70 ? 'bg-green-500' :
                        result.confidence >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{result.summary}</p>
                </div>

                {/* Recommendation */}
                <div className={`p-4 rounded-lg text-center font-semibold ${
                  result.recommendation === 'BUY' ? 'bg-green-100 text-green-700 border border-green-200' :
                  result.recommendation === 'SELL' ? 'bg-red-100 text-red-700 border border-red-200' :
                  'bg-yellow-100 text-yellow-700 border border-yellow-200'
                }`}>
                  {result.recommendation === 'BUY' && '📈 RECOMMENDATION: BUY'}
                  {result.recommendation === 'SELL' && '📉 RECOMMENDATION: SELL'}
                  {result.recommendation === 'HOLD' && '⏸️ RECOMMENDATION: HOLD'}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Upload a chart to see analysis</p>
                <p className="text-xs text-gray-400 mt-1">AI will detect patterns and provide insights</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
