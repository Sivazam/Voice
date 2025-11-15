'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Building, 
  Calendar, 
  FileText, 
  MapPin, 
  Upload, 
  Mic, 
  AlertCircle, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Play,
  Pause,
  Square,
  Trash2,
  Clock,
  Phone,
  Mail,
  Search,
  Filter
} from 'lucide-react';
import { CaseFormData, Gender, ApiResponse } from '@/types';

interface CaseSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: (caseId: string) => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Mumbai', 'Kolkata',
  'Chennai', 'Bengaluru', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
];

const DEPARTMENTS = [
  'Emergency', 'ICU', 'General Ward', 'OPD', 'Surgery', 'Pediatrics',
  'Gynecology', 'Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Other'
];

const ISSUE_CATEGORIES = [
  'No Prescription Provided',
  'GST Discrepancy',
  'Overcharging',
  'Unused Medications Not Returned',
  'Forced Medication Purchase',
  'Lack of Transparency'
];

const RELATIONSHIPS = [
  'Self', 'Parent', 'Spouse', 'Child', 'Sibling', 'Friend', 'Other'
];

// Initial form data - stable object to prevent re-renders
const INITIAL_FORM_DATA: CaseFormData = {
  patientName: '',
  patientAge: 0,
  patientGender: Gender.MALE,
  relationshipToPatient: 'Self',
  hospitalName: '',
  hospitalAddress: '',
  hospitalState: '',
  hospitalRegistrationNo: '',
  department: '',
  admissionDate: new Date(),
  isDischarged: false,
  dischargeDate: undefined,
  issueCategories: [],
  detailedDescription: '',
  voiceRecording: undefined,
  gpsLatitude: undefined,
  gpsLongitude: undefined,
  capturedAddress: '',
  attachments: []
};

export const CaseSubmissionModal = React.memo(function CaseSubmissionModal({ 
  isOpen, 
  onClose, 
  userId, 
  onSuccess 
}: CaseSubmissionModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [recordedAudio, setRecordedAudio] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  
  // Refs - moved outside component to prevent recreation
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState<CaseFormData>(INITIAL_FORM_DATA);
  
  const totalSteps = 5;
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Optimized form data update with minimal dependencies
  const updateFormData = useCallback((field: keyof CaseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Memoized validation function
  const validateCurrentStep = useCallback(() => {
    switch (currentStep) {
      case 1:
        return formData.patientName.trim() && formData.patientAge > 0;
      case 2:
        return formData.hospitalName.trim() && 
               formData.hospitalAddress.trim() && 
               formData.hospitalState && 
               formData.department;
      case 3:
        return formData.admissionDate && 
               (!formData.isDischarged || formData.dischargeDate);
      case 4:
        return formData.issueCategories.length > 0 && 
               formData.detailedDescription.length >= 100 && 
               recordedAudio;
      case 5:
        // Documents and GPS are now compulsory
        return uploadedFiles.length > 0 && 
               formData.gpsLatitude && 
               formData.gpsLongitude;
      default:
        return false;
    }
  }, [currentStep, formData, recordedAudio, uploadedFiles]);

  // Optimized file upload handler
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 50 * 1024 * 1024;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      return file.size <= maxSize && allowedTypes.includes(file.type);
    });

    if (validFiles.length !== files.length) {
      setError('Some files were rejected. Only images and PDFs under 50MB are allowed.');
      return;
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
    updateFormData('attachments', [...formData.attachments, ...validFiles]);
  }, [formData.attachments, updateFormData]);

  // Optimized file removal
  const removeFile = useCallback((index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    updateFormData('attachments', newFiles);
  }, [uploadedFiles, updateFormData]);

  // Optimized location handler
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateFormData('gpsLatitude', position.coords.latitude);
        updateFormData('gpsLongitude', position.coords.longitude);
        updateFormData('capturedAddress', 'Location captured successfully');
      },
      (error) => {
        setError('Unable to get your location. Please enter manually.');
      }
    );
  }, []);

  // Optimized recording functions with proper cleanup
  const startRecording = useCallback(async () => {
    try {
      // Cleanup any existing recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioFile);
        
        setRecordedAudio(audioFile);
        setAudioUrl(url);
        updateFormData('voiceRecording', audioFile);
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 300) {
            stopRecording();
            return 300;
          }
          return prev + 1;
        });
      }, 1000);

      setIsRecording(true);
    } catch (error) {
      setError('Unable to access microphone. Please check permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, [isRecording, mediaRecorderRef, recordingIntervalRef]);

  // Format time for display
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Reset recording
  const resetRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setRecordedAudio(null);
    setAudioUrl('');
    setRecordingTime(0);
    updateFormData('voiceRecording', null);
  }, [audioUrl, updateFormData]);

  // Optimized audio playback
  const playAudio = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [isPlaying, audioRef]);

  const deleteRecording = useCallback(() => {
    setRecordedAudio(null);
    setAudioUrl('');
    setRecordingTime(0);
    setIsPlaying(false);
    setPlaybackTime(0);
    setAudioDuration(0);
    updateFormData('voiceRecording', undefined);
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  }, []);

  // Optimized audio event handlers
  const handleAudioLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  }, []);

  const handleAudioTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setPlaybackTime(audioRef.current.currentTime);
    }
  }, []);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
    setPlaybackTime(0);
  }, []);

  // Optimized form submission
  const handleSubmit = useCallback(async () => {
    console.log('🚀 Modal handleSubmit called');
    
    // Double-check validation before submission
    if (!validateCurrentStep()) {
      console.log('❌ Modal handleSubmit: validateCurrentStep failed');
      return;
    }
    
    // Additional check for Step 5 requirements
    if (currentStep === 5) {
      const hasDocuments = uploadedFiles.length > 0;
      const hasGPS = formData.gpsLatitude && formData.gpsLongitude;
      
      console.log('🔍 Modal handleSubmit Step 5 check:', {
        hasDocuments,
        hasGPS,
        uploadedFilesCount: uploadedFiles.length,
        gpsLat: formData.gpsLatitude,
        gpsLng: formData.gpsLongitude
      });
      
      if (!hasDocuments) {
        setError('Please upload at least one document before submitting');
        return;
      }
      
      if (!hasGPS) {
        setError('Please provide GPS location before submitting');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      let voiceRecordingUrl: string | null = null;
      let voiceRecordingDuration: number | null = null;
      let uploadedAttachments: {fileName: string, fileUrl: string, fileType: string, fileSize: number, storagePath?: string}[] = [];

      // Upload voice recording first
      if (recordedAudio) {
        try {
          // Create FormData for file upload
          const audioFormData = new FormData();
          audioFormData.append('file', recordedAudio);
          audioFormData.append('caseId', 'temp-case-id');
          
          const uploadResult = await fetch('/api/upload', {
            method: 'POST',
            body: audioFormData // Don't set Content-Type header for FormData
          });

          const uploadData = await uploadResult.json();
          
          if (uploadData.success) {
            voiceRecordingUrl = uploadData.data.fileUrl;
            voiceRecordingDuration = recordingTime;
          } else {
            console.error('Voice upload failed:', uploadData.error);
            setError('Failed to upload voice recording: ' + (uploadData.error || 'Unknown error'));
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error uploading audio to Firebase:', error);
          setError('Failed to upload voice recording. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Upload documents
      if (uploadedFiles.length > 0) {
        console.log('📤 Starting document upload:', uploadedFiles.length, 'files');
        
        for (const file of uploadedFiles) {
          try {
            const docFormData = new FormData();
            docFormData.append('file', file);
            docFormData.append('caseId', 'temp-case-id');
            
            const docUploadResult = await fetch('/api/upload', {
              method: 'POST',
              body: docFormData
            });

            const docUploadData = await docUploadResult.json();
            
            if (docUploadData.success) {
              uploadedAttachments.push({
                fileName: file.name,
                fileUrl: docUploadData.data.fileUrl,
                fileType: file.type,
                fileSize: file.size,
                storagePath: docUploadData.data.storagePath || null
              });
              console.log('✅ Document uploaded successfully:', file.name);
            } else {
              console.error('Document upload failed:', file.name, docUploadData.error);
            }
          } catch (error) {
            console.error('Error uploading document:', file.name, error);
          }
        }
        
        console.log('📊 Document upload completed:', uploadedAttachments.length, 'of', uploadedFiles.length);
      }

      const caseResponse = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData,
          admissionDate: formData.admissionDate.toISOString(),
          dischargeDate: formData.dischargeDate?.toISOString(),
          voiceRecordingUrl,
          voiceRecordingDuration,
          attachments: uploadedAttachments // Send uploaded documents
        })
      });

      const caseData: ApiResponse<{ caseId: string }> = await caseResponse.json();

      if (caseData.success && caseData.data?.caseId) {
        onSuccess(caseData.data.caseId);
      } else {
        setError(caseData.error || 'Failed to submit case');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId, formData, recordedAudio, recordingTime, validateCurrentStep, onSuccess, uploadedFiles]);

  // Simple utility functions
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Optimized navigation
  const handleNext = useCallback(() => {
    if (!validateCurrentStep()) return;
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, validateCurrentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  // Simple render step function
  const renderStep = useCallback(() => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 px-2 sm:px-0">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-lg font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-3">Personal Information</h3>
              <p className="text-gray-600">Tell us about the patient</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="patientName" className="text-sm font-medium">Patient Full Name *</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => updateFormData('patientName', e.target.value)}
                  placeholder="Enter patient's full name"
                  className="focus:ring-blue-500 h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patientAge" className="text-sm font-medium">Age *</Label>
                <Input
                  id="patientAge"
                  type="number"
                  value={formData.patientAge || ''}
                  onChange={(e) => updateFormData('patientAge', parseInt(e.target.value) || 0)}
                  placeholder="Enter age"
                  min={1}
                  max={120}
                  className="focus:ring-blue-500 h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Gender *</Label>
              <RadioGroup
                value={formData.patientGender}
                onValueChange={(value) => updateFormData('patientGender', value as Gender)}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MALE" id="male" className="w-4 h-4" />
                  <Label htmlFor="male" className="text-sm cursor-pointer">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="FEMALE" id="female" className="w-4 h-4" />
                  <Label htmlFor="female" className="text-sm cursor-pointer">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="OTHER" id="other" className="w-4 h-4" />
                  <Label htmlFor="other" className="text-sm cursor-pointer">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship" className="text-sm font-medium">Your Relationship to Patient *</Label>
              <Select value={formData.relationshipToPatient} onValueChange={(value) => updateFormData('relationshipToPatient', value)}>
                <SelectTrigger className="focus:ring-blue-500 h-11">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map((relationship) => (
                    <SelectItem key={relationship} value={relationship}>{relationship}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 px-2 sm:px-0">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-lg font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-3">Hospital Information</h3>
              <p className="text-gray-600">Provide hospital details</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="hospitalName" className="text-sm font-medium">Hospital Name *</Label>
                <Input
                  id="hospitalName"
                  value={formData.hospitalName}
                  onChange={(e) => updateFormData('hospitalName', e.target.value)}
                  placeholder="Enter hospital name"
                  className="focus:ring-blue-500 h-11"
                />
              </div>
              
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="hospitalAddress" className="text-sm font-medium">Hospital Address *</Label>
                <Textarea
                  id="hospitalAddress"
                  value={formData.hospitalAddress}
                  onChange={(e) => updateFormData('hospitalAddress', e.target.value)}
                  placeholder="Enter complete hospital address"
                  rows={3}
                  className="focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hospitalState" className="text-sm font-medium">State *</Label>
                <Select value={formData.hospitalState} onValueChange={(value) => updateFormData('hospitalState', value)}>
                  <SelectTrigger className="focus:ring-blue-500 h-11">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => updateFormData('department', value)}>
                  <SelectTrigger className="focus:ring-blue-500 h-11">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="hospitalRegistrationNo" className="text-sm font-medium">Registration Number (Optional)</Label>
                <Input
                  id="hospitalRegistrationNo"
                  value={formData.hospitalRegistrationNo}
                  onChange={(e) => updateFormData('hospitalRegistrationNo', e.target.value)}
                  placeholder="Enter registration number (optional)"
                  className="focus:ring-blue-500 h-11"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 px-2 sm:px-0">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-lg font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-3">Treatment Timeline</h3>
              <p className="text-gray-600">Provide treatment dates</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="admissionDate" className="text-sm font-medium">Admission Date *</Label>
                <Input
                  id="admissionDate"
                  type="date"
                  value={formData.admissionDate ? formData.admissionDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => updateFormData('admissionDate', new Date(e.target.value))}
                  className="focus:ring-blue-500 h-11"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-3">
                  <Checkbox
                    id="isDischarged"
                    checked={formData.isDischarged}
                    onCheckedChange={(checked) => updateFormData('isDischarged', checked)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isDischarged" className="text-sm font-medium cursor-pointer">Patient was discharged</Label>
                </div>
                <Label htmlFor="dischargeDate" className="text-sm font-medium">Discharge Date *</Label>
                <Input
                  id="dischargeDate"
                  type="date"
                  value={formData.isDischarged && formData.dischargeDate ? formData.dischargeDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => updateFormData('dischargeDate', new Date(e.target.value))}
                  placeholder="Discharge date"
                  className="focus:ring-blue-500 h-11"
                  disabled={!formData.isDischarged}
                />
                {!formData.isDischarged && (
                  <p className="text-xs text-gray-500 mt-1">Check "Patient was discharged" to enable discharge date</p>
                )}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 px-2 sm:px-0">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-lg font-bold">
                4
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-3">Complaint Details</h3>
              <p className="text-gray-600">Describe your complaint in detail</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="detailedDescription" className="text-sm font-medium">Detailed Description *</Label>
              <Textarea
                id="detailedDescription"
                value={formData.detailedDescription}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log('Description changed:', value);
                  updateFormData('detailedDescription', value);
                }}
                placeholder="Please provide a detailed description of your complaint (minimum 100 characters)..."
                rows={6}
                className="focus:ring-blue-500 resize-none"
              />
              <div className="text-sm text-gray-500 mt-1">
                {formData.detailedDescription.length}/100 characters
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Issue Categories *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ISSUE_CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center space-x-2 p-2 rounded border border-gray-200 hover:bg-gray-50">
                    <Checkbox
                      id={category}
                      checked={formData.issueCategories.includes(category)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          updateFormData('issueCategories', [...formData.issueCategories, category]);
                        } else {
                          updateFormData('issueCategories', formData.issueCategories.filter(c => c !== category));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <Label htmlFor={category} className="text-sm cursor-pointer flex-1">{category}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Voice Recording *</Label>
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50">
                <div className="flex flex-col items-center">
                  {audioUrl ? (
                    <div className="w-full space-y-4">
                      <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-lg border gap-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Mic className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Voice Recording</p>
                            <p className="text-sm text-gray-500">Duration: {formatTime(recordingTime)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <audio controls className="h-8" src={audioUrl}>
                            Your browser does not support the audio element.
                          </audio>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetRecording}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Mic className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-gray-600 mb-4">Record your voice complaint</p>
                      <Button
                        onClick={startRecording}
                        disabled={isRecording}
                        className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                      >
                        {isRecording ? (
                          <>
                            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                            Recording... {formatTime(recordingTime)}
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4 mr-2" />
                            Start Recording
                          </>
                        )}
                      </Button>
                      {isRecording && (
                        <Button
                          onClick={stopRecording}
                          variant="outline"
                          className="ml-0 sm:ml-2 mt-2 sm:mt-0"
                        >
                          <Square className="h-4 w-4 mr-2" />
                          Stop
                        </Button>
                      )}
                      <p className="text-sm text-gray-500 mt-2">Maximum recording time: 5 minutes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 px-2 sm:px-0">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-lg font-bold">
                5
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-3">Location & Evidence</h3>
              <p className="text-red-600 font-medium">Both location and documents are REQUIRED to submit your case</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capturedAddress" className="text-sm font-medium">Captured Address</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Textarea
                  id="capturedAddress"
                  value={formData.capturedAddress}
                  onChange={(e) => updateFormData('capturedAddress', e.target.value)}
                  placeholder="Enter address or let us capture automatically"
                  rows={3}
                  className="focus:ring-blue-500 resize-none flex-1"
                />
                <Button
                  type="button"
                  onClick={getCurrentLocation}
                  variant="outline"
                  className="px-4 py-2 h-auto whitespace-nowrap w-full sm:w-auto bg-red-600 text-white hover:bg-red-700"
                  title="Capture GPS Location (Required)"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Capture GPS Location *
                </Button>
              </div>
              {formData.gpsLatitude && formData.gpsLongitude && (
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded border border-green-200">
                  ✓ Location captured: {formData.gpsLatitude.toFixed(6)}, {formData.gpsLongitude.toFixed(6)}
                </div>
              )}
            </div>
              
            <div className="space-y-2">
              <Label htmlFor="fileUpload" className="text-sm font-medium">Upload Documents <span className="text-red-500">*</span> (Required)</Label>
              <div 
                className="border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg p-4 sm:p-6 cursor-pointer hover:border-blue-500 hover:bg-blue-100 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="text-center">
                  <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-blue-700 font-medium">Click to upload files</p>
                  <p className="text-sm text-gray-600">Images and PDFs up to 50MB</p>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Uploaded Files</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1 min-w-0">
                            <FileText className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                            <span className="text-sm font-medium truncate">{file.name}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="ml-2 flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [currentStep, formData, uploadedFiles, updateFormData, removeFile, 
      audioUrl, isRecording, recordingTime, recordedAudio, 
      startRecording, stopRecording, formatTime, resetRecording, getCurrentLocation]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">File a New Case</h3>
              <p className="text-blue-100">Step {currentStep} of {totalSteps}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-blue-800"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <Progress value={progressPercentage} className="w-full" />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form Steps */}
          <div className="mb-8">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button
              onClick={currentStep === totalSteps ? handleSubmit : handleNext}
              disabled={loading || !validateCurrentStep()}
              className="flex items-center"
            >
              {currentStep === totalSteps ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {loading ? 'Submitting...' : 'Submit Case'}
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});