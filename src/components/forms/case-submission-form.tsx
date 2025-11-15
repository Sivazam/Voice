'use client';

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
import { FileUploadService } from '@/lib/attachment-service';

interface CaseSubmissionFormProps {
  userId: string;
  onSuccess: (caseId: string) => void;
  onCancel: () => void;
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

const INITIAL_FORM_DATA: CaseFormData = {
  // Step 1: Personal Information
  patientName: '',
  patientAge: 0,
  patientGender: Gender.MALE,
  relationshipToPatient: 'Self',
  
  // Step 2: Hospital Information
  hospitalName: '',
  hospitalAddress: '',
  hospitalState: '',
  hospitalRegistrationNo: '',
  department: '',
  
  // Step 3: Treatment Timeline
  admissionDate: new Date(),
  isDischarged: false,
  dischargeDate: undefined,
  
  // Step 4: Complaint Details
  issueCategories: [],
  detailedDescription: '',
  voiceRecording: undefined,
  
  // Step 5: Location & Evidence
  gpsLatitude: undefined,
  gpsLongitude: undefined,
  capturedAddress: '',
  attachments: []
};

export const CaseSubmissionForm = React.memo(function CaseSubmissionForm({ userId, onSuccess, onCancel }: CaseSubmissionFormProps) {
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState<CaseFormData>(INITIAL_FORM_DATA);

  const totalSteps = 5;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const updateFormData = useCallback((field: keyof CaseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Calculate treatment duration whenever dates change
  const calculateTreatmentDuration = () => {
    if (formData.admissionDate) {
      const endDate = formData.isDischarged && formData.dischargeDate 
        ? formData.dischargeDate 
        : new Date();
      const duration = Math.ceil((endDate.getTime() - formData.admissionDate.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(0, duration);
    }
    return 0;
  };

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

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 50 * 1024 * 1024; // 50MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      return file.size <= maxSize && allowedTypes.includes(file.type);
    });

    if (validFiles.length !== files.length) {
      setError('Some files were rejected. Only images and PDFs under 50MB are allowed.');
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
    updateFormData('attachments', [...(formData.attachments || []), ...validFiles]);
  }, [formData.attachments, updateFormData]);

  const removeFile = useCallback((index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    updateFormData('attachments', newFiles);
  }, [uploadedFiles, updateFormData]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateFormData('gpsLatitude', position.coords.latitude);
          updateFormData('gpsLongitude', position.coords.longitude);
          // In a real app, you would use reverse geocoding to get the address
          updateFormData('capturedAddress', 'Location captured successfully');
        },
        (error) => {
          setError('Unable to get your location. Please enter manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const startRecording = async () => {
    try {
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
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer with 5-minute limit
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 300) { // 5 minutes = 300 seconds
            stopRecording();
            return 300;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      setError('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const deleteRecording = () => {
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
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setPlaybackTime(audioRef.current.currentTime);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setPlaybackTime(0);
  };

  // Cleanup on unmount
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

  const hasFilesToUpload = () => {
    // Documents are now compulsory - must have at least one uploaded file
    const hasDocuments = uploadedFiles.length > 0;
    const hasAudio = recordedAudio !== null;
    const hasGPS = formData.gpsLatitude && formData.gpsLongitude;
    
    const result = hasDocuments && hasAudio && hasGPS;
    
    console.log('🔍 Submit validation check:', {
      hasDocuments,
      hasAudio,
      hasGPS,
      result,
      uploadedFilesCount: uploadedFiles.length,
      hasRecordedAudio: !!recordedAudio,
      gpsLat: formData.gpsLatitude,
      gpsLng: formData.gpsLongitude,
      currentStep,
      totalSteps
    });
    
    // Require all three: documents, audio, and GPS location
    return result;
  };

  const validateCurrentStep = () => {
    console.log('🔍 Validating current step:', currentStep);
    
    switch (currentStep) {
      case 1:
        if (!formData.patientName.trim() || formData.patientAge <= 0) {
          setError('Please fill in all required fields');
          return false;
        }
        break;
      case 2:
        if (!formData.hospitalName.trim() || !formData.hospitalAddress.trim() || !formData.hospitalState || !formData.department) {
          setError('Please fill in all required fields');
          return false;
        }
        break;
      case 3:
        if (!formData.admissionDate) {
          setError('Please provide admission date');
          return false;
        }
        if (formData.isDischarged && !formData.dischargeDate) {
          setError('Please provide discharge date');
          return false;
        }
        break;
      case 4:
        if (formData.issueCategories.length === 0) {
          setError('Please select at least one issue category');
          return false;
        }
        if (formData.detailedDescription.length < 100) {
          setError('Please provide a detailed description (minimum 100 characters)');
          return false;
        }
        if (!recordedAudio) {
          setError('Voice recording is required. Please record your statement.');
          return false;
        }
        break;
      case 5:
        console.log('🔍 Step 5 validation:', {
          uploadedFilesCount: uploadedFiles.length,
          hasGPS: !!(formData.gpsLatitude && formData.gpsLongitude)
        });
        
        // Documents are now compulsory
        if (uploadedFiles.length === 0) {
          setError('Please upload at least one document (medical records, reports, or evidence)');
          return false;
        }
        // GPS location is now compulsory
        if (!formData.gpsLatitude || !formData.gpsLongitude) {
          setError('Please provide GPS location of the incident');
          return false;
        }
        break;
    }
    console.log('✅ Step validation passed');
    return true;
  };

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

  // Enhanced file upload with progress tracking using new FileUploadService
  const uploadFile = async (file: File, caseId: string): Promise<{fileName: string, fileUrl: string, fileType: string, fileSize: number, storagePath?: string} | null> => {
    try {
      console.log('📤 Starting upload for file:', file.name, 'caseId:', caseId);
      
      const uploadResult = await FileUploadService.uploadFile(file, caseId);
      
      if (uploadResult) {
        console.log('✅ Upload successful:', uploadResult);
        return uploadResult;
      }
      
      console.log('❌ Upload failed for file:', file.name);
      return null;
    } catch (error) {
      console.error('Error uploading file to Firebase:', error);
      return null;
    }
  };

  const uploadFilesWithProgress = async (files: File[], caseId: string, onProgress?: (progress: number) => void) => {
    const results: {fileName: string, fileUrl: string, fileType: string, fileSize: number, storagePath?: string}[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await uploadFile(file, caseId);
      if (result) {
        results.push(result);
      }
      
      // Update progress
      const progress = Math.round(((i + 1) / files.length) * 100);
      onProgress?.(progress);
      
      console.log(`📊 Upload progress: ${progress}% (${i + 1}/${files.length}) - ${result ? 'SUCCESS' : 'FAILED'}`);
    }
    
    console.log(`✅ Batch upload completed: ${results.length}/${files.length} successful`);
    return results;
  };

  const handleSubmit = async () => {
    console.log('🚀 handleSubmit called');
    
    // Double-check validation before submission
    if (!validateCurrentStep()) {
      console.log('❌ handleSubmit: validateCurrentStep failed');
      return;
    }
    
    // Additional check for Step 5 requirements
    if (currentStep === 5) {
      const hasDocuments = uploadedFiles.length > 0;
      const hasGPS = formData.gpsLatitude && formData.gpsLongitude;
      
      console.log('🔍 handleSubmit Step 5 check:', {
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
    setUploadStatus('uploading');
    setUploadProgress(0);
    setIsUploading(true);

    try {
      console.log('📤 Form data before submission:', JSON.stringify(formData, null, 2));
      console.log('📤 uploadedFiles state:', uploadedFiles.length);
      console.log('📤 uploadedFiles details:', uploadedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
      
      // Generate a temporary case ID first
      const tempCaseId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // First upload audio if exists
      let voiceRecordingUrl: string | null = null;
      let voiceRecordingDuration: number | null = null;

      if (recordedAudio) {
        try {
          setUploadProgress(10);
          const audioUploadResult = await uploadFile(recordedAudio, tempCaseId);
          if (audioUploadResult) {
            voiceRecordingUrl = audioUploadResult.fileUrl;
            voiceRecordingDuration = recordingTime;
            setUploadProgress(30);
          }
        } catch (error) {
          console.error('Error uploading audio to Firebase:', error);
          setError('Failed to upload voice recording. Please try again.');
          setUploadStatus('error');
          setLoading(false);
          setIsUploading(false);
          return;
        }
      }

      // Upload other files to Firebase Storage with temp case ID and progress tracking
      let uploadedAttachments: {fileName: string, fileUrl: string, fileType: string, fileSize: number, storagePath?: string}[] = [];
      if (uploadedFiles.length > 0) {
        console.log('📤 Uploading files:', uploadedFiles.map(f => f.name));
        console.log('📤 Files count:', uploadedFiles.length);
        
        const fileUploadResults = await uploadFilesWithProgress(
          uploadedFiles, 
          tempCaseId,
          (progress) => {
            // Scale progress from 30-90% (audio took first 30%)
            const scaledProgress = 30 + Math.round((progress / 100) * 60);
            setUploadProgress(scaledProgress);
          }
        );
        
        console.log('📤 File upload results:', fileUploadResults);
        console.log('📤 File upload results length:', fileUploadResults.length);
        
        // Filter out null results and log failures
        const successfulUploads = fileUploadResults.filter(result => result !== null);
        const failedUploads = fileUploadResults.filter(result => result === null);
        
        console.log('✅ Successful uploads:', successfulUploads.length);
        console.log('❌ Failed uploads:', failedUploads.length);
        console.log('📤 Successful upload details:', successfulUploads);
        
        if (failedUploads.length > 0) {
          console.warn('Some files failed to upload, continuing with successful ones...');
        }
        
        uploadedAttachments = [...successfulUploads];
        
        console.log('📤 Final uploadedAttachments array:', uploadedAttachments.length);
        console.log('📤 Final uploadedAttachments details:', uploadedAttachments.map(att => ({ fileName: att.fileName, hasFileUrl: !!att.fileUrl, hasStoragePath: !!att.storagePath })));
      } else {
        console.log('📤 No files to upload - uploadedFiles.length is 0');
      }

      setUploadProgress(90);

      // Submit case data with voice recording and attachment info
      console.log('📤 Submitting case with attachments:', uploadedAttachments.length);
      console.log('📤 Attachment details:', JSON.stringify(uploadedAttachments, null, 2));
      
      const submissionData = {
        userId,
        patientName: formData.patientName,
        patientAge: formData.patientAge,
        patientGender: formData.patientGender,
        relationshipToPatient: formData.relationshipToPatient,
        hospitalName: formData.hospitalName,
        hospitalAddress: formData.hospitalAddress,
        hospitalState: formData.hospitalState,
        hospitalRegistrationNo: formData.hospitalRegistrationNo,
        department: formData.department,
        admissionDate: formData.admissionDate.toISOString(),
        isDischarged: formData.isDischarged,
        dischargeDate: formData.dischargeDate?.toISOString(),
        issueCategories: formData.issueCategories,
        detailedDescription: formData.detailedDescription,
        gpsLatitude: formData.gpsLatitude,
        gpsLongitude: formData.gpsLongitude,
        capturedAddress: formData.capturedAddress,
        voiceRecordingUrl,
        voiceRecordingDuration,
        attachments: uploadedAttachments.filter(att => att && att.fileName && att.fileUrl), // Use uploaded attachments only
        tempCaseId // Send temp case ID to move files if needed
      };

      // Note: We're NOT including formData.voiceRecording (File object) or formData.attachments (File objects)
      // Only sending the processed URLs and uploaded attachment info
      
      console.log('📤 Final submission data attachments:', submissionData.attachments);
      console.log('📤 Final submission data attachments length:', submissionData.attachments.length);
      console.log('📤 Final submission data attachments JSON:', JSON.stringify(submissionData.attachments, null, 2));
      console.log('📤 Final submission data:', JSON.stringify(submissionData, null, 2));
      
      const caseResponse = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      const caseData: ApiResponse<{ caseId: string }> = await caseResponse.json();

      if (caseData.success && caseData.data?.caseId) {
        const caseId = caseData.data.caseId;
        setUploadProgress(100);
        setUploadStatus('success');
        
        // Show success message for 2 seconds before redirecting
        setTimeout(() => {
          onSuccess(caseId);
        }, 2000);
      } else {
        setError(caseData.error || 'Failed to submit case');
        setUploadStatus('error');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      setUploadStatus('error');
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-lg font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-3">Personal Information</h3>
              <p className="text-gray-600">Tell us about the patient</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label htmlFor="patientName">Patient Full Name *</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => updateFormData('patientName', e.target.value)}
                  placeholder="Enter patient's full name"
                  className="focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-4">
                <Label htmlFor="patientAge">Age *</Label>
                <Input
                  id="patientAge"
                  type="number"
                  value={formData.patientAge || ''}
                  onChange={(e) => updateFormData('patientAge', parseInt(e.target.value) || 0)}
                  placeholder="Enter age"
                  min={1}
                  max={120}
                  className="focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Gender *</Label>
              <RadioGroup
                value={formData.patientGender}
                onValueChange={(value) => updateFormData('patientGender', value as Gender)}
                className="flex flex-col sm:flex-row gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MALE" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="FEMALE" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="OTHER" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label htmlFor="relationship">Your Relationship to Patient *</Label>
              <Select value={formData.relationshipToPatient} onValueChange={(value) => updateFormData('relationshipToPatient', value)}>
                <SelectTrigger className="focus:ring-blue-500">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map((relationship) => (
                    <SelectItem key={relationship} value={relationship}>
                      {relationship}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-lg font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-3">Hospital Information</h3>
              <p className="text-gray-600">Where did the treatment take place?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label htmlFor="hospitalName">Hospital Name *</Label>
                <Input
                  id="hospitalName"
                  value={formData.hospitalName}
                  onChange={(e) => updateFormData('hospitalName', e.target.value)}
                  placeholder="Enter hospital name"
                  className="focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-4">
                <Label htmlFor="hospitalAddress">Hospital Address *</Label>
                <Textarea
                  id="hospitalAddress"
                  value={formData.hospitalAddress}
                  onChange={(e) => updateFormData('hospitalAddress', e.target.value)}
                  placeholder="Enter complete hospital address"
                  rows={3}
                  className="focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label htmlFor="hospitalState">State *</Label>
                <Select value={formData.hospitalState} onValueChange={(value) => updateFormData('hospitalState', value)}>
                  <SelectTrigger className="focus:ring-blue-500">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <Label htmlFor="hospitalRegistrationNo">Registration Number</Label>
                <Input
                  id="hospitalRegistrationNo"
                  value={formData.hospitalRegistrationNo}
                  onChange={(e) => updateFormData('hospitalRegistrationNo', e.target.value)}
                  placeholder="Enter registration number (optional)"
                  className="focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label htmlFor="department">Department *</Label>
              <Select value={formData.department} onValueChange={(value) => updateFormData('department', value)}>
                <SelectTrigger className="focus:ring-blue-500">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-lg font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-3">Treatment Timeline</h3>
              <p className="text-gray-600">When did the treatment occur?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label htmlFor="admissionDate">Admission Date *</Label>
                <Input
                  id="admissionDate"
                  type="date"
                  value={formData.admissionDate ? formData.admissionDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => updateFormData('admissionDate', new Date(e.target.value))}
                  className="focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Checkbox
                    id="isDischarged"
                    checked={formData.isDischarged}
                    onCheckedChange={(checked) => updateFormData('isDischarged', checked)}
                  />
                  <Label htmlFor="isDischarged">Patient was discharged</Label>
                </div>
                
                {formData.isDischarged && (
                  <Input
                    id="dischargeDate"
                    type="date"
                    value={formData.dischargeDate ? formData.dischargeDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => updateFormData('dischargeDate', new Date(e.target.value))}
                    placeholder="Discharge date"
                    className="focus:ring-blue-500"
                  />
                )}
              </div>
            </div>

            {calculateTreatmentDuration() > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">
                    Treatment Duration: {calculateTreatmentDuration()} days
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-lg font-bold">
                4
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-3">Complaint Details</h3>
              <p className="text-gray-600">What issues did you experience?</p>
            </div>
            
            <div className="space-y-4">
              <Label>Issue Categories *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {ISSUE_CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
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
                    />
                    <Label htmlFor={category} className="text-sm">{category}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label htmlFor="detailedDescription">Detailed Description *</Label>
              <Textarea
                id="detailedDescription"
                value={formData.detailedDescription}
                onChange={(e) => updateFormData('detailedDescription', e.target.value)}
                placeholder="Please provide a detailed description of your complaint (minimum 100 characters)..."
                rows={6}
                className="focus:ring-blue-500"
              />
              <div className="text-sm text-gray-500 mt-1">
                {formData.detailedDescription.length}/100 characters
              </div>
            </div>

            <div className="space-y-4">
              <Label>Voice Recording *</Label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                {recordedAudio ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-800 font-medium">Recording saved</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={deleteRecording}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                    
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      controls
                      onLoadedMetadata={handleAudioLoadedMetadata}
                      onTimeUpdate={handleAudioTimeUpdate}
                      onEnded={handleAudioEnded}
                      className="w-full"
                    />
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Duration: {formatDuration(audioDuration)}</span>
                      <span>Current: {formatDuration(playbackTime)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mb-4">
                      <Mic className="h-12 w-12 text-red-600 mx-auto mb-2" />
                    </div>
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-full ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                    >
                      {isRecording ? (
                        <>
                          <Square className="h-4 w-4 mr-2" />
                          Stop Recording ({formatDuration(recordingTime)})
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      Maximum recording time: 5 minutes
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-lg font-bold">
                5
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mt-3">Location & Evidence (Required) - {new Date().toLocaleTimeString()}</h3>
              <p className="text-red-600 font-medium">Both location and documents are required to submit your case</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Label>Current Location <span className="text-red-500">*</span></Label>
                  <span className="text-sm text-gray-500">(Required - Click to capture GPS location)</span>
                </div>
                <Button
                  onClick={getCurrentLocation}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!!(formData.gpsLatitude && formData.gpsLongitude)}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {formData.gpsLatitude && formData.gpsLongitude ? 'Location Captured ✓' : 'Get Current Location'}
                </Button>
                
                {formData.gpsLatitude && formData.gpsLongitude && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Location captured successfully</span>
                    </div>
                  </div>
                )}
              </div>
              
            <div className="space-y-4">
              <Label htmlFor="capturedAddress">Address (Optional)</Label>
              <Textarea
                id="capturedAddress"
                value={formData.capturedAddress}
                onChange={(e) => updateFormData('capturedAddress', e.target.value)}
                placeholder="Enter address or let us capture automatically"
                rows={3}
                className="focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Label>Supporting Documents <span className="text-red-500">*</span></Label>
              <span className="text-sm text-gray-500">(Required - At least one document must be uploaded)</span>
            </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">{file.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">File a Healthcare Complaint</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-white hover:bg-blue-800"
            >
              ✕
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {renderStep()}
          
          {/* Navigation */}
          {/* Upload Progress Display */}
          {isUploading && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-r-2 border-blue-600 border-t-transparent mr-2"></div>
                  <span className="text-sm font-medium text-blue-600">
                    {uploadStatus === 'uploading' ? 'Uploading files...' : 'Processing...'}
                  </span>
                </div>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              {uploadStatus === 'success' && (
                <div className="mt-2 text-sm text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  All files uploaded successfully!
                </div>
              )}
              {uploadStatus === 'error' && (
                <div className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Upload failed. Please try again.
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && !isUploading && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-800">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || isUploading}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps}
            </div>
            
            <Button
              onClick={currentStep === totalSteps ? handleSubmit : handleNext}
              disabled={(() => {
                const isDisabled = loading || isUploading || !validateCurrentStep() || (currentStep === totalSteps && !hasFilesToUpload());
                console.log('🔍 Button disabled state:', {
                  loading,
                  isUploading,
                  validateCurrentStep: validateCurrentStep(),
                  hasFilesToUpload: hasFilesToUpload(),
                  currentStep,
                  totalSteps,
                  isFinalStep: currentStep === totalSteps,
                  finalCondition: currentStep === totalSteps && !hasFilesToUpload(),
                  isDisabled
                });
                return isDisabled;
              })()}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-r-2 border-white border-t-transparent mr-2"></div>
                  Uploading... {uploadProgress}%
                </>
              ) : loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-r-2 border-white border-t-transparent mr-2"></div>
                  Processing...
                </>
              ) : currentStep === totalSteps ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Case
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