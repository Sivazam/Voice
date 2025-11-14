'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
  X,
  Download,
  Share2
} from 'lucide-react';
import { Case, CaseStatus, ApiResponse } from '@/types';

interface PublicCasesBrowserProps {
  isOpen: boolean;
  onClose: () => void;
}

const INDIAN_STATES = [
  'All States', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Mumbai', 'Kolkata',
  'Chennai', 'Bengaluru', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
];

const ISSUE_CATEGORIES = [
  'All Categories', 'No Prescription Provided',
  'GST Discrepancy',
  'Overcharging',
  'Unused Medications Not Returned',
  'Forced Medication Purchase',
  'Lack of Transparency'
];

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

export const PublicCasesBrowser = React.memo(function PublicCasesBrowser({ isOpen, onClose }: PublicCasesBrowserProps) {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('All States');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [sortBy, setSortBy] = useState('latest');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        search: searchTerm,
        state: stateFilter,
        category: categoryFilter,
        sort: sortBy,
        public: 'true'
      });

      const response = await fetch(`/api/cases/public?${params}`);
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
  }, [searchTerm, stateFilter, categoryFilter, sortBy]);

  useEffect(() => {
    if (isOpen) {
      fetchCases();
    }
  }, [isOpen, fetchCases]);

  const filteredCases = cases; // Backend handles filtering now

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

  const handleViewDetails = useCallback((case_: Case) => {
    setSelectedCase(case_);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Public Cases</h2>
          <p className="text-gray-600">Browse approved healthcare complaints</p>
        </div>
        <Button
          variant="outline"
          onClick={onClose}
          className="hover:bg-gray-50"
        >
          <X className="h-4 w-4 mr-2" />
          Close
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter Cases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ISSUE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sort">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases Grid */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {filteredCases.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No cases found</h3>
            <p className="text-gray-600">
              {searchTerm || stateFilter !== 'All States' || categoryFilter !== 'All Categories' 
                ? 'Try adjusting your filters or search terms'
                : 'No approved cases available yet'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((case_) => {
            const StatusIcon = statusIcons[case_.status];
            
            return (
              <Card key={case_.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewDetails(case_)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {case_.hospitalName}
                      </h3>
                      <Badge className={statusColors[case_.status]}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {getStatusText(case_.status)}
                      </Badge>
                    </div>
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center mb-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Filed: {formatDate(case_.submittedAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{case_.hospitalState}</span>
                      </div>
                    </div>

                    {case_.issueCategories && case_.issueCategories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {case_.issueCategories.slice(0, 2).map((category, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {category.category}
                          </Badge>
                        ))}
                        {case_.issueCategories.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{case_.issueCategories.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <p className="text-sm text-gray-700 line-clamp-3">
                      {case_.detailedDescription}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

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
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Patient Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Patient Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedCase.patientName}</div>
                    <div><span className="font-medium">Age:</span> {selectedCase.patientAge}</div>
                    <div><span className="font-medium">Gender:</span> {selectedCase.patientGender}</div>
                    <div><span className="font-medium">Relationship:</span> {selectedCase.relationshipToPatient}</div>
                  </div>
                </div>

                {/* Hospital Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Hospital Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedCase.hospitalName}</div>
                    <div><span className="font-medium">Address:</span> {selectedCase.hospitalAddress}</div>
                    <div><span className="font-medium">State:</span> {selectedCase.hospitalState}</div>
                    <div><span className="font-medium">Department:</span> {selectedCase.department}</div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Treatment Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Admission:</span> {formatDate(selectedCase.admissionDate)}</div>
                    {selectedCase.isDischarged && selectedCase.dischargeDate && (
                      <div><span className="font-medium">Discharge:</span> {formatDate(selectedCase.dischargeDate)}</div>
                    )}
                  </div>
                </div>

                {/* Case Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900">Complaint Details</h4>
                  <div className="space-y-2 text-sm">
                    {selectedCase.issueCategories && selectedCase.issueCategories.length > 0 && (
                      <div className="mb-3">
                        <span className="font-medium">Issues:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedCase.issueCategories.map((category, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {category.category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div><span className="font-medium">Description:</span></div>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">
                      {selectedCase.detailedDescription}
                    </p>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              {selectedCase.attachments && selectedCase.attachments.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedCase.attachments.map((attachment, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm font-medium">{attachment.fileName}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(attachment.fileUrl, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Voice Recording */}
              {selectedCase.voiceRecordingUrl && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Voice Recording</h4>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <audio controls className="w-full" src={selectedCase.voiceRecordingUrl}>
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span>
                  <Badge className={`ml-2 ${statusColors[selectedCase.status]}`}>
                    {(() => {
                      const StatusIcon = statusIcons[selectedCase.status];
                      return <StatusIcon className="h-3 w-3 mr-1" />;
                    })()}
                    {getStatusText(selectedCase.status)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `Healthcare Case: ${selectedCase.hospitalName}`,
                          text: selectedCase.detailedDescription,
                          url: window.location.href
                        });
                      }
                    }}
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
      )}
    </div>
  );
});