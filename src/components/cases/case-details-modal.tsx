'use client';

import React, { useState, useRef, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  MapPin, 
  User, 
  Building, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Phone,
  Mail,
  Paperclip,
  Play,
  Pause,
  Download
} from 'lucide-react';
import { Case, CaseStatus, Gender } from '@/types';

interface CaseDetailsModalProps {
  case_: Case;
  isOpen: boolean;
  onClose: () => void;
}

const statusConfig = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
  APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
  REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
  RESOLVED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Resolved' }
};

export function CaseDetailsModal({ case_, isOpen, onClose }: CaseDetailsModalProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatDate = (date: Date | string | undefined | any) => {
    if (!date) return 'N/A';
    try {
      let dateObj: Date;
      
      if (typeof date === 'object' && date !== null && 'seconds' in date) {
        dateObj = new Date((date as any).seconds * 1000 + ((date as any).nanoseconds || 0) / 1000000);
      } else {
        dateObj = new Date(date);
      }
      
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      return dateObj.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatDateTime = (date: Date | string | undefined | any) => {
    if (!date) return 'N/A';
    try {
      let dateObj: Date;
      
      if (typeof date === 'object' && date !== null && 'seconds' in date) {
        dateObj = new Date((date as any).seconds * 1000 + ((date as any).nanoseconds || 0) / 1000000);
      } else {
        dateObj = new Date(date);
      }
      
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      return dateObj.toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return 'Invalid Date';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateDuration = () => {
    if (!case_.admissionDate) return 0;
    try {
      const admissionDate = new Date(case_.admissionDate);
      const endDate = case_.dischargeDate ? new Date(case_.dischargeDate) : new Date();
      
      if (isNaN(admissionDate.getTime()) || isNaN(endDate.getTime())) {
        return 0;
      }
      
      return Math.ceil((endDate.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24));
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 0;
    }
  };

  const handleAudioPlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        if (audioRef.current.readyState < 2) {
          await new Promise((resolve) => {
            if (audioRef.current) {
              audioRef.current.addEventListener('canplay', resolve, { once: true });
            }
          });
        }
        
        await audioRef.current.play();
        setIsPlayingAudio(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      if ((error as Error).name === 'NotAllowedError') {
        alert('Please interact with the page first to play audio');
      } else {
        window.open(case_.voiceRecordingUrl, '_blank');
      }
    }
  };

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return;
    
    const current = audioRef.current.currentTime;
    const duration = audioRef.current.duration;
    
    if (!isNaN(duration) && duration > 0) {
      setCurrentTime(current);
      setAudioProgress((current / duration) * 100);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (!audioRef.current) return;
    
    const duration = audioRef.current.duration;
    if (!isNaN(duration) && duration > 0) {
      setAudioDuration(duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlayingAudio(false);
    setAudioProgress(0);
    setCurrentTime(0);
  };

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    console.error('Audio error:', e);
  };

  useEffect(() => {
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
      setAudioProgress(0);
      setCurrentTime(0);
    }
  }, [isOpen]);

  const statusInfo = statusConfig[case_.status];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] h-[85vh] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-col sm:flex-row items-start justify-between space-y-3 sm:space-y-0 pb-4 border-b">
          <div className="flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:items-center gap-3">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <DialogTitle className="text-lg font-semibold truncate max-w-[200px] sm:max-w-none">
                {case_.hospitalName}
              </DialogTitle>
            </div>
            <Badge className={`${statusInfo.color} shrink-0 px-3 py-1`}>
              <statusInfo.icon className="h-3 w-3 mr-1" />
              <span className="text-xs font-medium">{statusInfo.label}</span>
            </Badge>
          </div>
          <DialogDescription className="text-xs text-gray-600">
            Case ID: {case_.id.slice(0, 8)}... • Filed on {formatDateTime(case_.submittedAt)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 h-[calc(85vh-80px)] px-4 sm:px-6 pb-6">
          <div className="space-y-4">
            {/* Patient Information Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <User className="h-4 w-4" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Full Name</p>
                    <p className="text-sm font-medium">{case_.patientName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Age</p>
                    <p className="text-sm font-medium">{case_.patientAge} years</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Gender</p>
                    <p className="text-sm font-medium">{case_.patientGender}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Relationship</p>
                    <p className="text-sm font-medium">{case_.relationshipToPatient}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hospital Information Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Building className="h-4 w-4" />
                  Hospital Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Hospital Name</p>
                    <p className="text-sm font-medium">{case_.hospitalName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Department</p>
                    <p className="text-sm font-medium">{case_.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">State</p>
                    <p className="text-sm font-medium">{case_.hospitalState}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</p>
                    <p className="text-sm font-medium">{case_.hospitalAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reg. Number</p>
                    <p className="text-sm font-medium">{case_.hospitalRegistrationNo || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Treatment Timeline Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Calendar className="h-4 w-4" />
                  Treatment Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Admission</p>
                    <p className="text-sm font-medium">{formatDate(case_.admissionDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                    <p className="text-sm font-medium">{case_.isDischarged ? 'Discharged' : 'Admitted'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Duration</p>
                    <p className="text-sm font-medium">{calculateDuration()} days</p>
                  </div>
                  {case_.dischargeDate && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Discharge</p>
                      <p className="text-sm font-medium">{formatDate(case_.dischargeDate)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Issue Categories Card */}
            {case_.issueCategories && case_.issueCategories.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <AlertCircle className="h-4 w-4" />
                    Issue Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {case_.issueCategories.map((category, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {category.category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Detailed Description Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <FileText className="h-4 w-4" />
                  Detailed Description
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {case_.detailedDescription}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Voice Recording Card */}
            {case_.voiceRecordingUrl && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Play className="h-4 w-4" />
                    Voice Recording
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <audio
                  ref={audioRef}
                  src={`/api/proxy/storage?url=${encodeURIComponent(case_.voiceRecordingUrl)}`}
                  onTimeUpdate={handleAudioTimeUpdate}
                  onLoadedMetadata={handleAudioLoadedMetadata}
                  onEnded={handleAudioEnded}
                  onError={handleAudioError}
                  preload="metadata"
                  className="hidden"
                />
                
                <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAudioPlay}
                      className="flex items-center gap-2"
                    >
                      {isPlayingAudio ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isPlayingAudio ? 'Pause' : 'Play'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/api/proxy/storage?url=${encodeURIComponent(case_.voiceRecordingUrl || '')}`, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="w-full sm:w-48 mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${audioProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{formatDuration(currentTime)}</span>
                      <span>{formatDuration(audioDuration)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Attachments Card */}
            {case_.attachments && case_.attachments.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-base font-semibold">
                      <Paperclip className="h-4 w-4" />
                      Attachments
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {case_.attachments.length} files
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {case_.attachments.map((attachment, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-100 flex-shrink-0">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" title={attachment.fileName}>
                              {attachment.fileName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {attachment.fileType} • {(attachment.fileSize / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/api/proxy/storage?url=${encodeURIComponent(attachment.fileUrl || '')}`, '_blank')}
                          className="w-full sm:w-auto mt-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Location Information Card */}
            {(case_.gpsLatitude && case_.gpsLongitude) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <MapPin className="h-4 w-4" />
                    Location Information
                </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">GPS Coordinates</p>
                      <p className="text-sm font-mono">{case_.gpsLatitude.toFixed(6)}, {case_.gpsLongitude.toFixed(6)}</p>
                    </div>
                    {case_.capturedAddress && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</p>
                        <p className="text-sm font-medium">{case_.capturedAddress}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
            </Card>
            )}

            {/* Admin Information Card */}
            {case_.reviewedBy && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    Review Information
                </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reviewed By</p>
                      <p className="text-sm font-medium">Admin User</p>
                    </div>
                    {case_.reviewedAt && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Review Date</p>
                        <p className="text-sm font-medium">{formatDateTime(case_.reviewedAt)}</p>
                      </div>
                    )}
                    {case_.adminComments && (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Admin Comments</p>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm">{case_.adminComments}</p>
                        </div>
                      </div>
                    )}
                    {case_.rejectionReason && (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Rejection Reason</p>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-sm text-red-800">{case_.rejectionReason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
            </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}