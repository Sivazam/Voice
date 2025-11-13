'use client';

import { useState, useRef, useEffect } from 'react';
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
import { CaseSubmissionForm, Gender, ApiResponse } from '@/types';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState<CaseSubmissionForm>({
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
  });

  const totalSteps = 5;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const updateFormData = (field: keyof CaseSubmissionForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    updateFormData('attachments', [...formData.attachments, ...validFiles]);
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    updateFormData('attachments', newFiles);
  };

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
  }, [audioUrl]);

  const validateCurrentStep = () => {
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
        // Location and evidence are optional
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setLoading(true);
    setError('');

    try {
      // First upload audio if exists
      let voiceRecordingUrl = null;
      let voiceRecordingDuration = null;

      if (recordedAudio) {
        try {
          const uploadResult = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: recordedAudio,
              caseId: 'temp-case-id'
            })
          });

          const uploadData = await uploadResult.json();
          if (uploadData.success) {
            voiceRecordingUrl = uploadData.data.fileUrl;
            voiceRecordingDuration = recordingTime;
          }
        } catch (error) {
          console.error('Error uploading audio to Firebase:', error);
          setError('Failed to upload voice recording. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Submit case data with voice recording info
      const caseResponse = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData,
          admissionDate: formData.admissionDate.toISOString(),
          dischargeDate: formData.dischargeDate?.toISOString(),
          voiceRecordingUrl,
          voiceRecordingDuration
        })
      });

      const caseData: ApiResponse<{ caseId: string }> = await caseResponse.json();

      if (caseData.success && caseData.data?.caseId) {
        const caseId = caseData.data.caseId;

        // Upload other files to Firebase Storage
        if (uploadedFiles.length > 0) {
          await Promise.all(
            uploadedFiles.map(async (file) => {
              try {
                const uploadResult = await fetch('/api/upload', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    file,
                    caseId
                  })
                });
                return {
                  fileName: file.name,
                  fileUrl: (await uploadResult.json()).data?.fileUrl || '',
                  fileType: file.type,
                  fileSize: file.size
                };
              } catch (error) {
                console.error('Error uploading file to Firebase:', error);
                return null;
              }
            })
          );
        }

        onSuccess(caseId);
      } else {
        setError(caseData.error || 'Failed to submit case');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
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
              <h3 className="text-xl font-semibold text-gray-900 mt-3">Location & Evidence</h3>
              <p className="text-gray-600">Add supporting documents and location</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label>Current Location</Label>
                <Button
                  onClick={getCurrentLocation}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!!(formData.gpsLatitude && formData.gpsLongitude)}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {formData.gpsLatitude && formData.gpsLongitude ? 'Location Captured' : 'Get Current Location'}
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
              <Label>Supporting Documents (Optional)</Label>
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
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
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
              disabled={loading || !validateCurrentStep()}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
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
}