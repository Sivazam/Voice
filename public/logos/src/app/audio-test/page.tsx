'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AudioTest } from '@/components/audio-test';
import { AudioDurationFix } from '@/components/audio-duration-fix';
import { Case, ApiResponse } from '@/types';
import { AlertTriangle, Search } from 'lucide-react';

export default function AudioTestPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/cases/public');
      const data: ApiResponse<Case[]> = await response.json();

      if (data.success && data.data) {
        // Filter cases that have audio recordings
        const casesWithAudio = data.data.filter(case_ => case_.voiceRecordingUrl);
        setCases(casesWithAudio);
        
        if (casesWithAudio.length > 0) {
          setSelectedCase(casesWithAudio[0]);
        }
      } else {
        setError(data.error || 'Failed to fetch cases');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Audio Tests...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Search className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Audio Testing Dashboard
              </h1>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="hover:bg-blue-50"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Audio Testing Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-700">
                <p className="mb-2">This page helps test audio functionality across different implementations:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Direct URL:</strong> Tests original Firebase Storage URL (may have CORS issues)</li>
                  <li><strong>Proxy URL:</strong> Tests audio through our API proxy (recommended)</li>
                  <li><strong>Custom Controls:</strong> Tests enhanced audio controls with error handling</li>
                </ul>
                <p className="mt-2 text-green-700 font-medium">✅ Green checkmarks indicate successful tests</p>
                <p className="text-red-700 font-medium">❌ Red X marks indicate failed tests</p>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Case Selection */}
          {cases.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Case for Testing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cases.map((case_) => (
                    <div
                      key={case_.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedCase?.id === case_.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedCase(case_)}
                    >
                      <div className="font-medium text-sm mb-1">{case_.caseTitle}</div>
                      <div className="text-xs text-gray-600">{case_.name}</div>
                      <div className="text-xs text-gray-500 mt-1">ID: {case_.id.slice(0, 12)}...</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audio Test Component */}
          {selectedCase && (
            <AudioTest 
              audioUrl={selectedCase.voiceRecordingUrl} 
              title={`Audio Test - ${selectedCase.caseTitle}`}
            />
          )}

          {/* Audio Duration Fix Component */}
          {selectedCase && (
            <AudioDurationFix 
              audioUrl={selectedCase.voiceRecordingUrl} 
              title={`Duration Fix - ${selectedCase.caseTitle}`}
            />
          )}

          {/* No Cases with Audio */}
          {cases.length === 0 && !error && (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Audio Cases Found</h3>
                <p className="text-gray-600">
                  There are currently no cases with audio recordings available for testing.
                </p>
                <Button 
                  onClick={fetchCases} 
                  className="mt-4"
                  variant="outline"
                >
                  Refresh
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}