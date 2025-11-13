'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
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

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  RESOLVED: 'bg-blue-100 text-blue-800'
};

const statusIcons = {
  PENDING: Clock,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
  RESOLVED: CheckCircle
};

export function CaseDetailsModal({ case_, isOpen, onClose }: CaseDetailsModalProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  const getStatusText = (status: CaseStatus) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'Invalid Date';
      return dateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatDateTime = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'Invalid Date';
      return dateObj.toLocaleString('en-IN', {
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
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateDuration = () => {
    if (!case_.admissionDate) return 0;
    try {
      const admissionDate = new Date(case_.admissionDate);
      const endDate = case_.dischargeDate ? new Date(case_.dischargeDate) : new Date();
      
      // Check if dates are valid
      if (isNaN(admissionDate.getTime()) || isNaN(endDate.getTime())) {
        return 0;
      }
      
      return Math.ceil((endDate.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24));
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 0;
    }
  };

  const handleAudioPlay = () => {
    setIsPlayingAudio(!isPlayingAudio);
    // Mock audio playback
    if (!isPlayingAudio) {
      const interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            clearInterval(interval);
            return 0;
          }
          return prev + 1;
        });
      }, 100);
    }
  };

  const StatusIcon = statusIcons[case_.status];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>{case_.hospitalName}</span>
            <Badge className={statusColors[case_.status]}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {getStatusText(case_.status)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Case ID: {case_.id.slice(0, 8)}... | Filed on {formatDateTime(case_.submittedAt)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <User className="h-5 w-5 mr-2" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm text-gray-500 mb-1">Full Name</p>
                    <p className="font-medium text-sm md:text-base">{case_.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Age</p>
                    <p className="font-medium text-sm md:text-base">{case_.patientAge} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Gender</p>
                    <p className="font-medium text-sm md:text-base">{case_.patientGender}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm text-gray-500 mb-1">Relationship</p>
                    <p className="font-medium text-sm md:text-base">{case_.relationshipToPatient}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hospital Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Building className="h-5 w-5 mr-2" />
                  Hospital Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Hospital Name</p>
                    <p className="font-medium text-sm md:text-base">{case_.hospitalName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Department</p>
                    <p className="font-medium text-sm md:text-base">{case_.department}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">State</p>
                    <p className="font-medium text-sm md:text-base">{case_.hospitalState}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Address</p>
                    <p className="font-medium text-sm md:text-base">{case_.hospitalAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Reg. Number</p>
                    <p className="font-medium text-sm md:text-base">{case_.hospitalRegistrationNo || 'Not provided'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Treatment Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="h-5 w-5 mr-2" />
                  Treatment Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Admission Date</p>
                    <p className="font-medium text-sm md:text-base">{formatDate(case_.admissionDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Discharge Status</p>
                    <p className="font-medium text-sm md:text-base">{case_.isDischarged ? 'Discharged' : 'Admitted'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Treatment Duration</p>
                    <p className="font-medium text-sm md:text-base">{calculateDuration()} days</p>
                  </div>
                  {case_.dischargeDate && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Discharge Date</p>
                      <p className="font-medium text-sm md:text-base">{formatDate(case_.dischargeDate)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Issue Categories */}
            {case_.issueCategories && case_.issueCategories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Issue Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {case_.issueCategories.map((category, index) => (
                      <Badge key={index} variant="outline">
                        {category.category}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileText className="h-5 w-5 mr-2" />
                  Detailed Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {case_.detailedDescription}
                </p>
              </CardContent>
            </Card>

            {/* Voice Recording */}
            {case_.voiceRecordingUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Play className="h-5 w-5 mr-2" />
                    Voice Recording
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAudioPlay}
                      className="flex items-center space-x-2"
                    >
                      {isPlayingAudio ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {isPlayingAudio ? 'Pause' : 'Play'}
                    </Button>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                          style={{ width: `${audioProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {case_.voiceRecordingDuration ? formatDuration(case_.voiceRecordingDuration) : 'Unknown duration'}
                    </span>
                  </div>
                  {case_.voiceRecordingDuration && (
                    <div className="mt-2 text-xs text-gray-500">
                      Recording duration: {formatDuration(case_.voiceRecordingDuration)}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* If no voice recording, show a message */}
            {!case_.voiceRecordingUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Play className="h-5 w-5 mr-2" />
                    Voice Recording
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4 text-gray-500">
                    <Play className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No voice recording available for this case</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location Information */}
            {(case_.gpsLatitude && case_.gpsLongitude) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <MapPin className="h-5 w-5 mr-2" />
                    Location Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">GPS Coordinates</p>
                      <p className="font-medium text-sm md:text-base font-mono">
                        {case_.gpsLatitude.toFixed(6)}, {case_.gpsLongitude.toFixed(6)}
                      </p>
                    </div>
                    {case_.capturedAddress && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Captured Address</p>
                        <p className="font-medium text-sm md:text-base">{case_.capturedAddress}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attachments */}
            {case_.attachments && case_.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Paperclip className="h-5 w-5 mr-2" />
                    Attachments ({case_.attachments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {case_.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-sm">{attachment.fileName}</p>
                            <p className="text-xs text-gray-500">
                              {(attachment.fileSize / 1024).toFixed(1)} KB • {attachment.fileType}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admin Information (if available) */}
            {case_.reviewedBy && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Review Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Reviewed By</p>
                      <p className="font-medium text-sm md:text-base">Admin User</p>
                    </div>
                    {case_.reviewedAt && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Review Date</p>
                        <p className="font-medium text-sm md:text-base">{formatDateTime(case_.reviewedAt)}</p>
                      </div>
                    )}
                  </div>
                  {case_.adminComments && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Admin Comments</p>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm md:text-base">
                        {case_.adminComments}
                      </p>
                    </div>
                  )}
                  {case_.rejectionReason && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Rejection Reason</p>
                      <p className="text-red-700 bg-red-50 p-3 rounded text-sm md:text-base">
                        {case_.rejectionReason}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Case Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Case Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm text-gray-500">Case ID</p>
                    <p className="font-medium text-sm md:text-base font-mono break-all">{case_.id}</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm text-gray-500">Submitted At</p>
                    <p className="font-medium text-sm md:text-base">{formatDateTime(case_.submittedAt)}</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm text-gray-500">View Count</p>
                    <p className="font-medium text-sm md:text-base">{case_.viewCount} views</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}