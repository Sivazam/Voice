'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface AudioTestProps {
  audioUrl?: string;
  title?: string;
}

export function AudioTest({ audioUrl, title = "Audio Test" }: AudioTestProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{[key: string]: 'pending' | 'success' | 'error'}>({
    direct: 'pending',
    proxy: 'pending',
    custom: 'pending'
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const customAudioRef = useRef<HTMLAudioElement>(null);

  const testDirectAudio = async () => {
    if (!audioUrl) return;
    
    try {
      const audio = new Audio(audioUrl);
      await audio.play();
      audio.pause();
      setTestResults(prev => ({ ...prev, direct: 'success' }));
    } catch (error) {
      console.error('Direct audio test failed:', error);
      setTestResults(prev => ({ ...prev, direct: 'error' }));
    }
  };

  const testProxyAudio = async () => {
    if (!audioUrl) return;
    
    try {
      const proxyUrl = `/api/proxy/storage?url=${encodeURIComponent(audioUrl)}`;
      const audio = new Audio(proxyUrl);
      await audio.play();
      audio.pause();
      setTestResults(prev => ({ ...prev, proxy: 'success' }));
    } catch (error) {
      console.error('Proxy audio test failed:', error);
      setTestResults(prev => ({ ...prev, proxy: 'error' }));
    }
  };

  const testCustomAudio = async () => {
    if (!customAudioRef.current) return;
    
    try {
      await customAudioRef.current.play();
      customAudioRef.current.pause();
      setTestResults(prev => ({ ...prev, custom: 'success' }));
    } catch (error) {
      console.error('Custom audio test failed:', error);
      setTestResults(prev => ({ ...prev, custom: 'error' }));
    }
  };

  const handlePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Playback error:', error);
      setError((error as Error).message);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  if (!audioUrl) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Audio Available</h3>
          <p className="text-gray-600">This case does not have an audio recording.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Test Results */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Audio Test Results</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              {getStatusIcon(testResults.direct)}
              <div>
                <div className="font-medium text-sm">Direct URL</div>
                <div className="text-xs text-gray-500">Original Firebase URL</div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={testDirectAudio}
                className="ml-auto"
              >
                Test
              </Button>
            </div>
            
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              {getStatusIcon(testResults.proxy)}
              <div>
                <div className="font-medium text-sm">Proxy URL</div>
                <div className="text-xs text-gray-500">Via API proxy</div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={testProxyAudio}
                className="ml-auto"
              >
                Test
              </Button>
            </div>
            
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              {getStatusIcon(testResults.custom)}
              <div>
                <div className="font-medium text-sm">Custom Controls</div>
                <div className="text-xs text-gray-500">Enhanced controls</div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={testCustomAudio}
                className="ml-auto"
              >
                Test
              </Button>
            </div>
          </div>
        </div>

        {/* Standard HTML5 Audio */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Standard HTML5 Audio (Proxy)</h4>
          <audio 
            ref={audioRef}
            controls 
            className="w-full"
            src={`/api/proxy/storage?url=${encodeURIComponent(audioUrl)}`}
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          >
            Your browser does not support the audio element.
          </audio>
          <div className="text-sm text-gray-600">
            Duration: {formatTime(duration)} | Current: {formatTime(currentTime)}
          </div>
        </div>

        {/* Custom Audio Controls */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Custom Audio Controls (Proxy)</h4>
          <audio
            ref={customAudioRef}
            src={`/api/proxy/storage?url=${encodeURIComponent(audioUrl)}`}
            preload="metadata"
            className="hidden"
          />
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayPause}
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/api/proxy/storage?url=${encodeURIComponent(audioUrl)}`, '_blank')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">Error:</span>
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* URL Info */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">URL Information</h4>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">Original URL:</div>
            <div className="text-xs font-mono break-all">{audioUrl}</div>
            <div className="text-xs text-gray-600 mb-1 mt-2">Proxy URL:</div>
            <div className="text-xs font-mono break-all">{`/api/proxy/storage?url=${encodeURIComponent(audioUrl)}`}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}