'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
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
  Filter,
  GraduationCap,
  Building,
  Receipt,
  Banknote,
  Shield,
  Landmark
} from 'lucide-react';
import { CaseFormData, ApiResponse } from '@/types';
import { MAIN_CATEGORIES } from '@/lib/constants';

interface CaseSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userPhone?: string;
  userName?: string;
  userEmail?: string;
  onSuccess: (caseId: string) => void;
}

// Initial form data
const INITIAL_FORM_DATA: CaseFormData = {
  mainCategory: '',
  caseTitle: '',
  name: '',
  email: '',
  phoneNumber: '',
  caseDescription: '',
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
  userPhone,
  userName,
  userEmail,
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
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState<CaseFormData>(INITIAL_FORM_DATA);
  
  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Initialize form with user data
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        phoneNumber: userPhone || '',
        name: userName || '',
        email: userEmail || ''
      }));
    }
  }, [isOpen, userPhone, userName, userEmail]);

  // Update form data
  const updateFormData = useCallback((field: keyof CaseFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Validation
  const validateCurrentStep = useCallback(() => {
    switch (currentStep) {
      case 1:
        return formData.mainCategory.trim();
      case 2:
        return formData.caseTitle.trim() && 
               formData.name.trim() && 
               formData.email.trim() && 
               formData.phoneNumber.trim();
      case 3:
        return formData.caseDescription.trim();
      case 4:
        return true; // All fields are optional in step 4
      default:
        return false;
    }
  }, [currentStep, formData]);

  // File upload handler
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

  // Remove file
  const removeFile = useCallback((index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    updateFormData('attachments', newFiles);
  }, [uploadedFiles, updateFormData]);

  // Get current location
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
  }, [updateFormData]);

  // Recording functions (simplified from original)
  const startRecording = useCallback(async () => {
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

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        setRecordedAudio(audioFile);
        updateFormData('voiceRecording', audioFile);
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError('');
      
      // Start timer
      const startTime = Date.now();
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      
    } catch (error) {
      setError('Unable to access microphone. Please check your permissions.');
    }
  }, [updateFormData]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  // Audio playback
  const togglePlayback = useCallback(() => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying, audioUrl]);

  // Form submission
  const handleSubmit = useCallback(async () => {
    if (!validateCurrentStep()) {
      setError('Please complete all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formDataToSubmit = new FormData();
      
      // Add form fields
      // Add user ID
      formDataToSubmit.append('userId', userId);
      
      formDataToSubmit.append('mainCategory', formData.mainCategory);
      formDataToSubmit.append('caseTitle', formData.caseTitle);
      formDataToSubmit.append('name', formData.name);
      formDataToSubmit.append('email', formData.email);
      formDataToSubmit.append('phoneNumber', formData.phoneNumber);
      formDataToSubmit.append('caseDescription', formData.caseDescription);
      
      if (formData.gpsLatitude) {
        formDataToSubmit.append('gpsLatitude', formData.gpsLatitude.toString());
      }
      if (formData.gpsLongitude) {
        formDataToSubmit.append('gpsLongitude', formData.gpsLongitude.toString());
      }
      if (formData.capturedAddress) {
        formDataToSubmit.append('capturedAddress', formData.capturedAddress);
      }
      
      // Add voice recording
      if (recordedAudio) {
        formDataToSubmit.append('voiceRecording', recordedAudio);
      }
      
      // Add attachments
      uploadedFiles.forEach((file, index) => {
        formDataToSubmit.append(`attachment_${index}`, file);
      });

      const response = await fetch('/api/cases', {
        method: 'POST',
        body: formDataToSubmit,
      });

      const result: ApiResponse<{ caseId: string }> = await response.json();

      if (result.success && result.data?.caseId) {
        onSuccess(result.data.caseId);
        handleClose();
      } else {
        setError(result.error || 'Failed to submit case');
      }
    } catch (error) {
      setError('An error occurred while submitting your case');
    } finally {
      setLoading(false);
    }
  }, [formData, recordedAudio, uploadedFiles, validateCurrentStep, onSuccess]);

  // Navigation
  const nextStep = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      setError('');
    } else {
      setError('Please complete all required fields');
    }
  }, [validateCurrentStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  }, []);

  const handleClose = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setUploadedFiles([]);
    setRecordedAudio(null);
    setAudioUrl('');
    setIsRecording(false);
    setRecordingTime(0);
    setIsPlaying(false);
    setCurrentStep(1);
    setError('');
    onClose();
  }, [onClose]);

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'education': return <GraduationCap className="h-6 w-6" />;
      case 'banking': return <Building className="h-6 w-6" />;
      case 'gst': return <Receipt className="h-6 w-6" />;
      case 'income-tax': return <Banknote className="h-6 w-6" />;
      case 'corruption': return <Shield className="h-6 w-6" />;
      case 'political': return <Landmark className="h-6 w-6" />;
      default: return <FileText className="h-6 w-6" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">File a Case</h2>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
          
          <Progress value={progressPercentage} className="w-full" />
          <p className="text-sm text-gray-600 mt-2">Step {currentStep} of {totalSteps}</p>
        </div>

        <div className="p-6">
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Category Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Select Category</h3>
                <p className="text-gray-600 mb-4">Choose the category that best describes your issue</p>
              </div>
              
              <RadioGroup value={formData.mainCategory} onValueChange={(value) => updateFormData('mainCategory', value)}>
                {MAIN_CATEGORIES.map((category) => (
                  <div key={category.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value={category.id} id={category.id} />
                    <div className="flex items-center space-x-3 flex-1">
                      {getCategoryIcon(category.id)}
                      <div>
                        <Label htmlFor={category.id} className="font-medium cursor-pointer">
                          {category.name}
                        </Label>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                <p className="text-gray-600 mb-4">Tell us about yourself</p>
              </div>
              
              <div>
                <Label htmlFor="caseTitle">Case Title *</Label>
                <Input
                  id="caseTitle"
                  value={formData.caseTitle}
                  onChange={(e) => updateFormData('caseTitle', e.target.value)}
                  placeholder="Brief title for your case"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="Your full name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="your.email@example.com"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                  placeholder="Your phone number"
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Step 3: Case Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Case Details</h3>
                <p className="text-gray-600 mb-4">Describe your issue in detail</p>
              </div>
              
              <div>
                <Label htmlFor="caseDescription">Case Description *</Label>
                <Textarea
                  id="caseDescription"
                  value={formData.caseDescription}
                  onChange={(e) => updateFormData('caseDescription', e.target.value)}
                  placeholder="Please provide a detailed description of your issue..."
                  rows={6}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Voice Recording (Optional)</Label>
                <div className="mt-2 p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {!isRecording && !recordedAudio && (
                      <Button onClick={startRecording} variant="outline">
                        <Mic className="h-4 w-4 mr-2" />
                        Start Recording
                      </Button>
                    )}
                    
                    {isRecording && (
                      <Button onClick={stopRecording} variant="destructive">
                        <Square className="h-4 w-4 mr-2" />
                        Stop Recording ({formatTime(recordingTime)})
                      </Button>
                    )}
                    
                    {recordedAudio && (
                      <div className="flex items-center space-x-2">
                        <Button onClick={togglePlayback} variant="outline" size="sm">
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <span className="text-sm text-gray-600">Voice recording ready</span>
                        <Button onClick={() => {
                          setRecordedAudio(null);
                          setAudioUrl('');
                          updateFormData('voiceRecording', undefined);
                        }} variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {audioUrl && (
                    <audio
                      ref={audioRef}
                      src={audioUrl}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Location & Attachments */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Location & Evidence</h3>
                <p className="text-gray-600 mb-4">Add supporting documents and location</p>
              </div>
              
              <div>
                <Label>Location (Optional)</Label>
                <div className="mt-2 space-y-2">
                  <Button onClick={getCurrentLocation} variant="outline" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Get Current Location
                  </Button>
                  {formData.capturedAddress && (
                    <p className="text-sm text-green-600">✓ {formData.capturedAddress}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label>Supporting Documents (Optional)</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Documents
                  </Button>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm truncate">{file.name}</span>
                        <Button onClick={() => removeFile(index)} variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < totalSteps ? (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Case'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});