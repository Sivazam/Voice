'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Download, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface AudioDurationFixProps {
  audioUrl?: string;
  title?: string;
}

export function AudioDurationFix({ audioUrl, title = "Audio Duration Fix" }: AudioDurationFixProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [actualDuration, setActualDuration] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fixAttempts, setFixAttempts] = useState(0);
  const [audioInfo, setAudioInfo] = useState<any>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const testAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      // Reset state when URL changes
      setDuration(0);
      setActualDuration(null);
      setError(null);
      setFixAttempts(0);
    }
  }, [audioUrl]);

  const analyzeAudioFile = async () => {
    if (!audioUrl) return;

    console.log('🔍 Starting audio analysis...');
    setFixAttempts(prev => prev + 1);

    try {
      // Method 1: Direct audio element analysis
      const audio = new Audio();
      audio.src = audioUrl;
      
      audio.addEventListener('loadedmetadata', () => {
        console.log('📊 Direct audio metadata:', {
          duration: audio.duration,
          readyState: audio.readyState,
          currentTime: audio.currentTime
        });
        
        if (audio.duration && audio.duration > 0) {
          setActualDuration(audio.duration);
          setAudioInfo({
            method: 'Direct Analysis',
            duration: audio.duration,
            size: 'Unknown',
            estimatedBitrate: 'Unknown'
          });
        }
      });

      audio.addEventListener('error', (e) => {
        console.error('❌ Direct audio analysis failed:', e);
        analyzeWithProxy();
      });

      audio.load();

    } catch (error) {
      console.error('❌ Audio analysis failed:', error);
      analyzeWithProxy();
    }
  };

  const analyzeWithProxy = async () => {
    if (!audioUrl) return;

    console.log('🔍 Analyzing with proxy...');
    
    try {
      const proxyUrl = `/api/proxy/storage?url=${encodeURIComponent(audioUrl)}`;
      const response = await fetch(proxyUrl, { method: 'HEAD' });
      
      if (response.ok) {
        const contentLength = response.headers.get('content-length');
        const contentType = response.headers.get('content-type');
        
        console.log('📊 Proxy analysis:', {
          contentLength,
          contentType,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (contentLength) {
          const sizeInBytes = parseInt(contentLength);
          const sizeInKB = sizeInBytes / 1024;
          
          // Estimate duration based on file size and typical audio bitrates
          const estimates = {
            '64 kbps': (sizeInKB * 8) / 64, // Low quality voice
            '128 kbps': (sizeInKB * 8) / 128, // Standard quality
            '256 kbps': (sizeInKB * 8) / 256, // High quality
          };

          console.log('📊 Duration estimates:', estimates);

          setAudioInfo({
            method: 'Proxy Analysis',
            fileSize: `${sizeInKB.toFixed(1)} KB`,
            contentType,
            estimates
          });

          // Use the most reasonable estimate (128 kbps for voice)
          const reasonableDuration = estimates['128 kbps'];
          if (reasonableDuration > 0 && reasonableDuration < 600) { // Under 10 minutes
            setActualDuration(reasonableDuration);
          }
        }
      }
    } catch (error) {
      console.error('❌ Proxy analysis failed:', error);
      setError('Failed to analyze audio file');
    }
  };

  const testPlayback = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
        
        // Monitor actual playback
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
          if (audioRef.current) {
            const elapsed = (Date.now() - startTime) / 1000;
            setCurrentTime(audioRef.current.currentTime);
            
            // If we've played significantly longer than the reported duration,
            // the duration metadata is wrong
            if (elapsed > 10 && audioRef.current.currentTime > 0) {
              console.log('🎵 Actual playback time:', elapsed, 'Reported:', audioRef.current.duration);
              if (actualDuration === null || actualDuration === 0) {
                setActualDuration(elapsed);
              }
            }
          }
        }, 100);

        audioRef.current.addEventListener('ended', () => {
          clearInterval(checkInterval);
          setIsPlaying(false);
          const totalPlayed = (Date.now() - startTime) / 1000;
          console.log('🎵 Total playback time:', totalPlayed);
          setActualDuration(totalPlayed);
        }, { once: true });
      }
    } catch (error) {
      console.error('Playback error:', error);
      setError((error as Error).message);
    }
  };

  const fixDuration = () => {
    if (actualDuration && actualDuration > 0) {
      setDuration(actualDuration);
      console.log('✅ Fixed duration to:', actualDuration);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time <= 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getDurationStatus = () => {
    if (!duration || duration === 0) return { status: 'unknown', color: 'bg-gray-100 text-gray-800', icon: AlertTriangle };
    
    if (duration > 600) { // Over 10 minutes
      return { status: 'incorrect', color: 'bg-red-100 text-red-800', icon: XCircle };
    }
    
    if (duration > 120) { // Over 2 minutes
      return { status: 'suspicious', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    }
    
    return { status: 'correct', color: 'bg-green-100 text-green-800', icon: CheckCircle };
  };

  const durationStatus = getDurationStatus();

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
          <RefreshCw className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Duration Status */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Duration Analysis</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <durationStatus.icon className="h-4 w-4" />
              <div>
                <div className="font-medium text-sm">Reported Duration</div>
                <div className="text-lg font-bold">{formatTime(duration)}</div>
                <Badge className={`${durationStatus.color} mt-1`}>
                  {durationStatus.status}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              {actualDuration ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-yellow-600" />}
              <div>
                <div className="font-medium text-sm">Actual Duration</div>
                <div className="text-lg font-bold">
                  {actualDuration ? formatTime(actualDuration) : 'Not measured'}
                </div>
                <Badge className="bg-blue-100 text-blue-800 mt-1">
                  {actualDuration ? 'Measured' : 'Unknown'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Tools */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Analysis Tools</h4>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={analyzeAudioFile}>
              Analyze Audio
            </Button>
            {actualDuration && actualDuration !== duration && (
              <Button size="sm" onClick={fixDuration}>
                Fix Duration
              </Button>
            )}
          </div>
        </div>

        {/* Audio Player */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Test Playback</h4>
          <audio 
            ref={audioRef}
            controls 
            className="w-full"
            src={audioUrl ? `/api/proxy/storage?url=${encodeURIComponent(audioUrl)}` : ''}
            preload="metadata"
            onLoadedMetadata={() => {
              if (audioRef.current) {
                setDuration(audioRef.current.duration);
                console.log('🎵 Audio loaded metadata:', audioRef.current.duration);
              }
            }}
            onTimeUpdate={() => {
              if (audioRef.current) {
                setCurrentTime(audioRef.current.currentTime);
              }
            }}
          >
            Your browser does not support the audio element.
          </audio>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={testPlayback}
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Stop Test' : 'Start Test'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (audioUrl) {
                  window.open(`/api/proxy/storage?url=${encodeURIComponent(audioUrl)}`, '_blank');
                }
              }}
              className="flex items-center gap-2"
              disabled={!audioUrl}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            Current: {formatTime(currentTime)} | Duration: {formatTime(duration)}
          </div>
        </div>

        {/* Audio Info */}
        {audioInfo && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Audio Information</h4>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm space-y-1">
                <div><strong>Analysis Method:</strong> {audioInfo.method}</div>
                {audioInfo.fileSize && <div><strong>File Size:</strong> {audioInfo.fileSize}</div>}
                {audioInfo.contentType && <div><strong>Content Type:</strong> {audioInfo.contentType}</div>}
                {audioInfo.estimates && (
                  <div>
                    <strong>Duration Estimates:</strong>
                    <ul className="ml-4 mt-1">
                      {Object.entries(audioInfo.estimates).map(([bitrate, duration]) => (
                        <li key={bitrate}>{bitrate}: {formatTime(duration as number)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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

        {/* Fix Attempts */}
        {fixAttempts > 0 && (
          <div className="text-sm text-gray-600">
            Analysis attempts: {fixAttempts}
          </div>
        )}
      </CardContent>
    </Card>
  );
}