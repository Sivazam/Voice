'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Search,
  Filter,
  Calendar,
  MapPin,
  Paperclip,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Crown,
  Settings,
  ArrowLeft,
  Download,
  Play,
  Pause
} from 'lucide-react';
import { Case, CaseStatus, ApiResponse } from '@/types';
import { useAuthStore } from '@/store/auth-store';

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

export default function CaseReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [case_, setCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewComments, setReviewComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const caseId = params.id as string;

  // Add a separate effect to initialize auth check
  useEffect(() => {
    // Small delay to ensure auth store is properly initialized
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log('🔍 Case review page mounted');
    console.log('🔍 Case ID:', caseId);
    console.log('🔍 Is authenticated:', isAuthenticated);
    console.log('🔍 User:', user);
    console.log('🔍 Auth checked:', authChecked);
    
    // Wait a moment for auth to be properly initialized
    if (!authChecked) {
      console.log('🔍 Authentication not yet checked, waiting...');
      return;
    }
    
    if (!isAuthenticated) {
      console.log('🔍 User not authenticated, redirecting to login');
      router.push('/');
      return;
    }
    
    if (!user) {
      console.log('🔍 User data not available, redirecting to login');
      router.push('/');
      return;
    }
    
    console.log('🔍 Authentication check passed, fetching case');
    fetchCase();
  }, [caseId, isAuthenticated, user, authChecked]);

  const fetchCase = async () => {
    setLoading(true);
    setError('');

    console.log('🔍 Starting case fetch for caseId:', caseId);
    console.log('🔍 User authenticated:', isAuthenticated);
    console.log('🔍 User data:', user);

    try {
      const response = await fetch(`/api/cases/${caseId}`);
      console.log('🔍 API response status:', response.status);
      
      const data: ApiResponse<Case> = await response.json();
      console.log('🔍 API response data:', data);

      if (data.success && data.data) {
        console.log('✅ Case data set successfully');
        console.log('📊 Case data structure:', JSON.stringify(data.data, null, 2));
        setCase(data.data);
        setReviewComments(data.data.adminComments || '');
        setRejectionReason(data.data.rejectionReason || '');
      } else {
        console.log('❌ API returned error:', data.error);
        setError(data.error || 'Failed to fetch case');
      }
    } catch (error) {
      console.error('🔥 Fetch error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!user || !case_) {
      console.error('❌ Missing user or case data:', { user: !!user, case_: !!case_ });
      return;
    }
    
    console.log('🔍 Attempting approval with user:', {
      userId: user.id,
      fullName: user.fullName,
      role: user.role,
      phoneNumber: user.phoneNumber
    });
    console.log('🔍 Approving case:', {
      caseId: case_.id,
      currentStatus: case_.status
    });
    
    setProcessingAction(true);
    setError('');

    try {
      // Use POST with action parameter as workaround for preview environment CORS issues
      const response = await fetch('/api/admin/cases', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'approve',
          caseId: case_.id,
          status: 'APPROVED',
          adminComments: reviewComments,
          reviewedBy: user.id
        })
      });

      console.log('🔍 Approval response status:', response.status);
      console.log('🔍 Approval response headers:', Object.fromEntries(response.headers.entries()));

      const data: ApiResponse<Case> = await response.json();
      console.log('🔍 Approval response data:', data);

      if (data.success && data.data) {
        setCase(data.data);
        setReviewComments('');
        // Redirect back to admin panel
        router.push('/?activeTab=admin');
      } else {
        console.error('❌ Approval failed:', data.error);
        setError(data.error || 'Failed to approve case');
      }
    } catch (error) {
      console.error('❌ Approval error:', error);
      setError('Network error. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReject = async () => {
    if (!user || !case_) return;
    
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    setProcessingAction(true);
    setError('');

    try {
      // Use POST with action parameter as workaround for preview environment CORS issues
      const response = await fetch('/api/admin/cases', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: 'reject',
          caseId: case_.id,
          status: 'REJECTED',
          adminComments: reviewComments,
          rejectionReason,
          reviewedBy: user.id
        })
      });

      const data: ApiResponse<Case> = await response.json();

      if (data.success && data.data) {
        setCase(data.data);
        setReviewComments('');
        setRejectionReason('');
        // Redirect back to admin panel
        router.push('/?activeTab=admin');
      } else {
        setError(data.error || 'Failed to reject case');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    return dateObj.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (date: Date | string) => {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    return dateObj.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status: CaseStatus) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Case Details...</h2>
        </div>
      </div>
    );
  }

  if (error || !case_) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Case</h2>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button onClick={() => router.push('/?activeTab=admin')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Panel
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[case_.status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/?activeTab=admin')}
                className="hover:bg-blue-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin Panel
              </Button>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Case Review
                </h1>
              </div>
            </div>
            <Badge className={`${statusColors[case_.status]} px-4 py-2`}>
              <StatusIcon className="h-4 w-4 mr-2" />
              {getStatusText(case_.status)}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Case Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Case Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Case ID</Label>
                    <p className="text-sm text-gray-900 font-mono">{case_.id.slice(0, 12)}...</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={`${statusColors[case_.status]} mt-1`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {getStatusText(case_.status)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Patient Name</Label>
                    <p className="text-sm text-gray-900 font-medium">{case_.patientName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Age & Gender</Label>
                    <p className="text-sm text-gray-900">{case_.patientAge}, {case_.patientGender}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Hospital</Label>
                    <p className="text-sm text-gray-900">{case_.hospitalName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Department</Label>
                    <p className="text-sm text-gray-900">{case_.department}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Admission Date</Label>
                    <p className="text-sm text-gray-900">{formatDate(case_.admissionDate)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Submitted Date</Label>
                    <p className="text-sm text-gray-900">{formatDateTime(case_.submittedAt)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Submitted By</Label>
                    <p className="text-sm text-gray-900">{case_.user?.fullName}</p>
                  </div>
                </div>

                {/* Issue Categories */}
                {case_.issueCategories && case_.issueCategories.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Issue Categories</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {case_.issueCategories.map((category, index) => (
                        <Badge key={index} variant="outline">
                          {category.category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <Label className="text-sm font-medium">Detailed Description</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-lg max-h-48 overflow-y-auto">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                      {case_.detailedDescription}
                    </p>
                  </div>
                </div>

                {/* Attachments */}
                {case_.attachments && case_.attachments.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Attachments</Label>
                    <div className="mt-2 space-y-2">
                      {case_.attachments.map((attachment, index) => (
                        <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Paperclip className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{attachment.fileName}</p>
                              <p className="text-xs text-gray-500">
                                {(attachment.fileSize / 1024).toFixed(1)} KB • {attachment.fileType}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(attachment.fileUrl, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Audio Recording */}
                {case_.voiceRecordingUrl && (
                  <div>
                    <Label className="text-sm font-medium">Audio Recording</Label>
                    <div className="mt-2 p-3 border rounded-lg">
                      <audio 
                        controls 
                        className="w-full"
                        src={`/api/proxy/storage?url=${encodeURIComponent(case_.voiceRecordingUrl)}`}
                        preload="metadata"
                      >
                        Your browser does not support the audio element.
                      </audio>
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/api/proxy/storage?url=${encodeURIComponent(case_.voiceRecordingUrl)}`, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download Audio
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admin Actions Card */}
            {case_.status === 'PENDING' && user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Admin Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Admin Comments */}
                  <div>
                    <Label htmlFor="adminComments" className="text-sm font-medium">
                      Admin Comments
                    </Label>
                    <Textarea
                      id="adminComments"
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                      placeholder="Add your comments about this case..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  {/* Rejection Reason */}
                  <div>
                    <Label htmlFor="rejectionReason" className="text-sm font-medium">
                      Rejection Reason (if rejecting)
                    </Label>
                    <Textarea
                      id="rejectionReason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a clear reason for rejection..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={handleReject}
                      disabled={processingAction}
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      {processingAction ? 'Rejecting...' : 'Reject'}
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={processingAction}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      {processingAction ? 'Approving...' : 'Approve'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Access Denied Message for Regular Users */}
            {case_.status === 'PENDING' && user && user.role === 'USER' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Access Restricted
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-2">
                      This case is pending review by administrators.
                    </p>
                    <p className="text-sm text-gray-500">
                      Only administrators can approve or reject cases.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admin Review History */}
            {(case_.adminComments || case_.rejectionReason || case_.reviewedBy) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    Review History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {case_.reviewedAt && (
                    <div>
                      <Label className="text-sm font-medium">Reviewed On</Label>
                      <p className="text-sm text-gray-900">{formatDateTime(case_.reviewedAt)}</p>
                    </div>
                  )}
                  {case_.reviewedBy && (
                    <div>
                      <Label className="text-sm font-medium">Reviewed By</Label>
                      <p className="text-sm text-gray-900">{case_.reviewedBy}</p>
                    </div>
                  )}
                  {case_.adminComments && (
                    <div>
                      <Label className="text-sm font-medium">Admin Comments</Label>
                      <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-900">{case_.adminComments}</p>
                      </div>
                    </div>
                  )}
                  {case_.rejectionReason && (
                    <div>
                      <Label className="text-sm font-medium">Rejection Reason</Label>
                      <div className="mt-1 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-800">{case_.rejectionReason}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Status & Quick Actions */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Case Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <Badge className={`${statusColors[case_.status]} text-lg px-6 py-3`}>
                    <StatusIcon className="h-6 w-6 mr-2" />
                    {getStatusText(case_.status)}
                  </Badge>
                  <p className="text-sm text-gray-600">
                    {case_.status === 'PENDING' && 'Awaiting admin review'}
                    {case_.status === 'APPROVED' && 'Approved for public viewing'}
                    {case_.status === 'REJECTED' && 'Rejected by administrator'}
                    {case_.status === 'RESOLVED' && 'Case has been resolved'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(`/cases/${case_.id}`, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View as User
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/?activeTab=admin')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Back to Admin Panel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Error Alert */}
      {error && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}