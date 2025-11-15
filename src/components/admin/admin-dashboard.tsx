'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
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
  Crown,
  Settings
} from 'lucide-react';
import { Case, CaseStatus, ApiResponse } from '@/types';
import { UserManagement } from './user-management';

interface AdminDashboardProps {
  adminId: string;
  userRole?: 'ADMIN' | 'SUPERADMIN';
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

export function AdminDashboard({ adminId, userRole = 'ADMIN' }: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'cases' | 'users'>('cases');
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'ALL'>('PENDING' as CaseStatus | 'ALL');

  useEffect(() => {
    fetchCases();
  }, [statusFilter]);

  const fetchCases = async () => {
    setLoading(true);
    setError('');

    try {
      const url = statusFilter === 'ALL' 
        ? '/api/admin/cases'
        : `/api/admin/cases?status=${statusFilter}`;
      
      const response = await fetch(url);
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
      case_.user?.fullName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
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

  const stats = {
    total: cases.length,
    pending: cases.filter(c => c.status === 'PENDING').length,
    approved: cases.filter(c => c.status === 'APPROVED').length,
    rejected: cases.filter(c => c.status === 'REJECTED').length,
    resolved: cases.filter(c => c.status === 'RESOLVED').length
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
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
          <h1 className="text-3xl font-bold text-gray-900">
            {userRole === 'SUPERADMIN' ? 'Super Admin Dashboard' : 'Admin Dashboard'}
          </h1>
          <p className="text-gray-600">
            {userRole === 'SUPERADMIN' ? 'Manage users and review healthcare complaints' : 'Review and manage healthcare complaints'}
          </p>
        </div>
        <Badge className={`${userRole === 'SUPERADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'} text-lg px-4 py-2`}>
          {userRole === 'SUPERADMIN' ? <Crown className="h-5 w-5 mr-2" /> : <Shield className="h-5 w-5 mr-2" />}
          {userRole === 'SUPERADMIN' ? 'Super Administrator' : 'Administrator'}
        </Badge>
      </div>

      {/* Tabs for Super Admin */}
      {userRole === 'SUPERADMIN' && (
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={activeTab === 'cases' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('cases')}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            Cases
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('users')}
            className="flex-1"
          >
            <Users className="h-4 w-4 mr-2" />
            User Management
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cases</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-blue-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by hospital, patient, or case ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CaseStatus | 'ALL')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert for pending cases */}
      {stats.pending > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {stats.pending} case{stats.pending > 1 ? 's' : ''} pending review. 
            Please review them in a timely manner.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Cases List */}
      {filteredCases.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No cases found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Try adjusting your filters or search terms'
                : 'No cases match the current criteria'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCases.map((case_) => {
            const StatusIcon = statusIcons[case_.status];
            
            return (
              <Card key={case_.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {case_.hospitalName}
                        </h3>
                        <Badge className={statusColors[case_.status]}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {getStatusText(case_.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2" />
                          <span className="font-medium">Patient:</span>
                          <span className="ml-1">{case_.patientName}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="font-medium">Filed:</span>
                          <span className="ml-1">{formatDate(case_.submittedAt)}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{case_.hospitalState}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Paperclip className="h-4 w-4 mr-2" />
                          <span>{case_.attachments?.length || 0} attachments</span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">Submitted by:</span> {case_.user?.fullName} ({case_.user?.phoneNumber})
                      </div>

                      {case_.issueCategories && case_.issueCategories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
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

                      <div className="text-sm text-gray-700 line-clamp-2">
                        {case_.detailedDescription}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/cases/${case_.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review Case
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* User Management Tab - Only for Super Admins */}
      {userRole === 'SUPERADMIN' && activeTab === 'users' && (
        <UserManagement superAdminId={adminId} />
      )}
    </div>
  );
}