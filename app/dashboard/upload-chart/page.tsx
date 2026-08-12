'use client';

import { useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, X, Image as ImageIcon, TrendingUp, TrendingDown, Activity, AlertCircle, CheckCircle } from 'lucide-react';

interface AnalysisResult {
  pattern: string;
  trend: 'Uptrend' | 'Downtrend' | 'Ranging';
  support: string;
  resistance: string;
  entry: string;
  stopLoss: string;
  takeProfit: string;
  confidence: number;
  summary: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
}

export default function UploadChartPage() {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [symbol, setSymbol] = useState('EUR/USD');
  const [timeframe, setTimeframe] = useState('1h');
  const [credits, setCredits] = useState<number | null>(null);

  // Fetch credits on mount
  useState(() => {
    const fetchCredits = async () => {
      try {
        const res = await fetch('/api/user/status');
        if (res.ok) {
          const data = await res.json();
          setCredits(data.credits || 0);
        }
      } catch (err) {
        console.error('Failed to fetch credits:', err);
      }
    };
    fetchCredits();
  });

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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
        if (data.creditsRemaining !== undefined) setCredits(data.creditsRemaining);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📊 Upload Chart</h1>
          <p className="text-gray-500 text-sm">
            Upload a screenshot of any trading chart for AI‑powered pattern analysis and trade setups.
          </p>
        </div>
        {credits !== null && (
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Credits: {credits}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Upload & Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload size={20} /> Upload Chart Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
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
                ref={fileInputRef}
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
                  disabled={loading}
                >
                  <option value="EUR/USD">EUR/USD</option>
                  <option value="GBP/USD">GBP/USD</option>
                  <option value="USD/JPY">USD/JPY</option>
                  <option value="AUD/USD">AUD/USD</option>
                  <option value="USD/CAD">USD/CAD</option>
                  <option value="XAU/USD">Gold (XAU/USD)</option>
                  <option value="XAG/USD">Silver (XAG/USD)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  disabled={loading}
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

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              disabled={!selectedFile || loading || (credits !== null && credits <= 0)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg rounded-xl shadow-lg transition-all"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin mr-2" />
              ) : (
                <Activity size={20} className="mr-2" />
              )}
              {loading ? 'Analyzing...' : (credits !== null && credits <= 0) ? 'Insufficient Credits' : 'Analyze Chart'}
            </Button>

            {credits !== null && credits <= 0 && (
              <p className="text-sm text-red-500 text-center">
                You have no credits left. Please upgrade your plan.
              </p>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RIGHT: Results */}
        <Card className="min-h-[400px]">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity size={20} /> Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500">Detecting patterns and generating insights...</p>
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

                {/* Support & Resistance */}
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
                  {result.recommendation === 'BUY' && <TrendingUp size={18} className="inline mr-2" />}
                  {result.recommendation === 'SELL' && <TrendingDown size={18} className="inline mr-2" />}
                  {result.recommendation === 'HOLD' && <Activity size={18} className="inline mr-2" />}
                  RECOMMENDATION: {result.recommendation}
                </div>

                <Button variant="outline" onClick={() => setResult(null)} className="w-full">
                  Clear Results
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <ImageIcon size={48} className="mb-4 opacity-30" />
                <p className="text-lg font-medium">No analysis yet</p>
                <p className="text-sm">Upload a chart and click “Analyze Chart”</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
        <p className="font-semibold">⚠️ Risk Disclaimer</p>
        <p>AI‑generated chart analysis is for educational purposes only. Always conduct your own research before making trading decisions.</p>
      </div>
    </div>
  );
}
