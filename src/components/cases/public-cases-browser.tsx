'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  FileText, 
  Users, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Star,
  Heart,
  Share2,
  ExternalLink,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import { Case, CaseStatus, ApiResponse } from '@/types';

interface PublicCasesProps {
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
  REJECTED: AlertTriangle,
  RESOLVED: CheckCircle
};

const INDIAN_STATES = [
  'All States', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
];

const ISSUE_CATEGORIES = [
  'All Categories',
  'No Prescription Provided',
  'GST Discrepancy',
  'Overcharging',
  'Unused Medications Not Returned',
  'Forced Medication Purchase',
  'Lack of Transparency'
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Viewed' }
];

export function PublicCases({ isOpen, onClose }: PublicCasesProps) {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('All States');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [sortBy, setSortBy] = useState('latest');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCases();
    }
  }, [isOpen]);

  const fetchCases = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (stateFilter !== 'All States') params.append('state', stateFilter);
      if (categoryFilter !== 'All Categories') params.append('category', categoryFilter);
      if (searchTerm) params.append('search', searchTerm);
      if (sortBy !== 'latest') params.append('sort', sortBy);

      const response = await fetch(`/api/cases/public?${params.toString()}`);
      const data: ApiResponse<Case[]> = await response.json();

      if (data.success && data.data) {
        setCases(data.data);
      } else {
        setError(data.error || 'Failed to fetch cases');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = searchTerm === '' || 
      case_.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.detailedDescription.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesState = stateFilter === 'All States' || case_.hospitalState === stateFilter;
    const matchesCategory = categoryFilter === 'All Categories' || 
      case_.issueCategories?.some(cat => cat.category === categoryFilter);

    return matchesSearch && matchesState && matchesCategory;
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusText = (status: CaseStatus) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const handleShare = async (caseId: string) => {
    const shareUrl = `${window.location.origin}/cases/${caseId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Healthcare Complaint Case',
          text: `Check out this healthcare complaint case on HealthRights platform`,
          url: shareUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert('Case link copied to clipboard!');
    }
  };

  const stats = {
    total: cases.length,
    pending: cases.filter(c => c.status === 'PENDING').length,
    approved: cases.filter(c => c.status === 'APPROVED').length,
    rejected: cases.filter(c => c.status === 'REJECTED').length,
    resolved: cases.filter(c => c.status === 'RESOLVED').length
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Public Healthcare Cases</h2>
              <p className="text-blue-100">Browse verified healthcare complaints</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-blue-800"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Cases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.resolved}</div>
              <div className="text-sm text-gray-600">Resolved</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by hospital, patient, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger>
                  <SelectValue />
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

            <div className="w-full md:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ISSUE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-r-2 border-blue-600 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="p-8">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No cases found</h3>
              <p className="text-gray-600">
                {searchTerm || stateFilter !== 'All States' || categoryFilter !== 'All Categories'
                  ? 'Try adjusting your filters or search terms'
                  : 'No cases match the current criteria'
                }
              </p>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCases.map((case_) => {
                const StatusIcon = statusIcons[case_.status];
                
                return (
                  <Card key={case_.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {case_.hospitalName}
                            </h3>
                            <Badge className={statusColors[case_.status]}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {getStatusText(case_.status)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600 space-x-4">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{case_.hospitalState}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{formatDate(case_.submittedAt)}</span>
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              <span>{case_.viewCount} views</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          <span className="font-medium">Patient:</span>
                          <span>{case_.patientAge} years, {case_.patientGender}</span>
                        </div>

                        <div className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                          {case_.detailedDescription}
                        </div>

                        {case_.issueCategories && case_.issueCategories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {case_.issueCategories.slice(0, 3).map((category, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {category.category}
                              </Badge>
                            ))}
                            {case_.issueCategories.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{case_.issueCategories.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="text-xs text-gray-500">
                            Case ID: {case_.id}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCase(case_)}
                              className="text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShare(case_.id)}
                              className="text-gray-600 hover:bg-gray-50"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Case Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Case Details</h3>
                  <p className="text-blue-100">Case ID: {selectedCase.id}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCase(null)}
                  className="text-white hover:bg-blue-800"
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Hospital Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Hospital Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Hospital Name</p>
                      <p className="font-medium">{selectedCase.hospitalName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">{selectedCase.hospitalAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">State</p>
                      <p className="font-medium">{selectedCase.hospitalState}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-medium">{selectedCase.department}</p>
                    </div>
                  </div>
                </div>

                {/* Patient Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Patient Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="font-medium">{selectedCase.patientAge} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-medium">{selectedCase.patientGender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Relationship</p>
                      <p className="font-medium">{selectedCase.relationshipToPatient}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Treatment Duration</p>
                      <p className="font-medium">
                        {selectedCase.admissionDate && selectedCase.isDischarged && selectedCase.dischargeDate
                          ? `${Math.ceil((new Date(selectedCase.dischargeDate).getTime() - new Date(selectedCase.admissionDate).getTime()) / (1000 * 60 * 60 * 24))} days`
                          : 'Ongoing'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Complaint Details */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Complaint Details</h4>
                  <div className="space-y-3">
                    {selectedCase.issueCategories && selectedCase.issueCategories.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Issues Reported:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedCase.issueCategories.map((category, index) => (
                            <Badge key={index} variant="outline">
                              {category.category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Description:</p>
                      <p className="text-gray-700 leading-relaxed">{selectedCase.detailedDescription}</p>
                    </div>

                    {selectedCase.voiceRecordingUrl && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Voice Recording:</p>
                        <audio controls className="w-full">
                          <source src={selectedCase.voiceRecordingUrl} type="audio/webm" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                  </div>
                </div>

                {/* Attachments */}
                {selectedCase.attachments && selectedCase.attachments.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Supporting Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedCase.attachments.map((attachment, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-sm">{attachment.fileName}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {(attachment.fileSize / 1024 / 1024).toFixed(1)} MB • {attachment.fileType}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(attachment.fileUrl, '_blank')}
                            className="text-blue-600 hover:bg-blue-50"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-500">
                    Submitted on {formatDate(selectedCase.submittedAt)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare(selectedCase.id)}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                    <Button
                      onClick={() => setSelectedCase(null)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}