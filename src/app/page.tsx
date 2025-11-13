'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, FileText, Search, Bell, MapPin, CheckCircle, AlertCircle, Clock, User, LogOut, Settings, TrendingUp, Eye, Phone, Mail, ArrowRight, Star, Zap, Globe, Lock, Heart } from 'lucide-react';
import Link from 'next/link';
import { LoginModal } from '@/components/auth/login-modal';
import { ProfileCompletionModal } from '@/components/auth/profile-completion-modal';
import { ProfileSettings } from '@/components/user/profile-settings';
import { CaseSubmissionForm } from '@/components/forms/case-submission-form';
import { CaseTrackingDashboard } from '@/components/cases/case-tracking-dashboard';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { PublicCasesBrowser } from '@/components/cases/public-cases-browser';
import { useAuthStore } from '@/store/auth-store';
import { User as UserType } from '@/types';

export default React.memo(function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'features' | 'about' | 'dashboard' | 'admin' | 'public-cases'>('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [pendingUserId, setPendingUserId] = useState('');
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState('');

  const { user, isAuthenticated, login, logout } = useAuthStore();

  const features = [
    {
      icon: FileText,
      title: 'File Cases',
      description: 'Report hospital malpractices, overcharging, and other healthcare issues',
      color: 'text-blue-600',
      bgGradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: Search,
      title: 'Track Progress',
      description: 'Monitor your case status in real-time with detailed updates',
      color: 'text-green-600',
      bgGradient: 'from-green-500 to-green-600'
    },
    {
      icon: Shield,
      title: 'Admin Review',
      description: 'All cases reviewed by verified administrators for authenticity',
      color: 'text-purple-600',
      bgGradient: 'from-purple-500 to-purple-600'
    },
    {
      icon: Users,
      title: 'Public Transparency',
      description: 'Access approved cases to make informed healthcare decisions',
      color: 'text-orange-600',
      bgGradient: 'from-orange-500 to-orange-600'
    }
  ];

  const stats = [
    { label: 'Cases Filed', value: '1,234', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'Resolved', value: '892', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
    { label: 'Pending Review', value: '156', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    { label: 'Active Users', value: '5,678', icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-50' }
  ];

  const issueCategories = [
    'No Prescription Provided',
    'GST Discrepancy',
    'Overcharging',
    'Unused Medications Not Returned',
    'Forced Medication Purchase',
    'Lack of Transparency'
  ];

  const handleLoginSuccess = (userData: UserType) => {
    login(userData);
  };

  const handleProfileRequired = (userId: string, phoneNumber: string) => {
    setPendingUserId(userId);
    setPendingPhoneNumber(phoneNumber);
    setShowLoginModal(false);
    setShowProfileModal(true);
  };

  const handleProfileSuccess = (userData: UserType) => {
    login(userData);
    setPendingUserId('');
    setPendingPhoneNumber('');
  };

  const handleLogout = () => {
    logout();
  };

  const handleFileCase = () => {
    if (isAuthenticated) {
      setShowCaseForm(true);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleCaseSubmitSuccess = React.useCallback((caseId: string) => {
    setShowCaseForm(false);
    // In a real app, you might show a success message or redirect to case details
    // For now, we'll just log it
    console.log(`Case submitted successfully! Case ID: ${caseId}`);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  HealthRights
                </h1>
              </div>
              <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-1">
                Healthcare Transparency Platform
              </Badge>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('home')}
                className={`font-medium transition-all duration-200 px-3 py-2 rounded-lg hover:bg-blue-50 ${
                  activeTab === 'home' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Home
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`font-medium transition-all duration-200 px-3 py-2 rounded-lg hover:bg-blue-50 ${
                    activeTab === 'dashboard' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  My Cases
                </button>
              )}
              {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`font-medium transition-all duration-200 px-3 py-2 rounded-lg hover:bg-blue-50 ${
                    activeTab === 'admin' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Admin Panel
                </button>
              )}
              <button
                onClick={() => setActiveTab('public-cases')}
                className={`font-medium transition-all duration-200 px-3 py-2 rounded-lg hover:bg-blue-50 ${
                  activeTab === 'public-cases' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Public Cases (Coming Soon)
              </button>
              <button
                onClick={() => setActiveTab('features')}
                className={`font-medium transition-all duration-200 px-3 py-2 rounded-lg hover:bg-blue-50 ${
                  activeTab === 'features' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                Features
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`font-medium transition-all duration-200 px-3 py-2 rounded-lg hover:bg-blue-50 ${
                  activeTab === 'about' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                About
              </button>
            </nav>
            
            <div className="flex items-center space-x-3">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                    <div className="text-xs text-gray-500">{user.role}</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowProfileSettings(true)}
                    className="hover:bg-blue-50"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="hover:bg-red-50 text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowLoginModal(true)}
                    className="hover:bg-blue-50"
                  >
                    Sign In
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleFileCase}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    File a Case
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {activeTab === 'home' && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 hover:from-blue-200 hover:to-blue-300 px-6 py-3 rounded-full text-sm font-medium">
              <Shield className="h-4 w-4 mr-2" />
              Healthcare Transparency Platform
            </Badge>
            
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Voice for
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {' '}Better Healthcare
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Report hospital malpractices, track cases, and access transparent healthcare information. 
              Join thousands of patients fighting for their rights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl px-8 py-4 text-lg"
                onClick={handleFileCase}
              >
                <FileText className="h-5 w-5 mr-3" />
                File a New Case
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowPublicCases(true)}
                className="hover:bg-blue-50"
              >
                <Search className="h-5 w-5 mr-3" />
                Browse Public Cases
              </Button>
            </div>
            
            {isAuthenticated && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <p className="text-green-800 font-medium">
                    Welcome back, <strong>{user.fullName}</strong>! You're ready to file cases and track progress.
                  </p>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                          <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                        </div>
                        <div className={`p-3 rounded-full ${stat.bgColor}`}>
                          <Icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Stats Bar */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-16 text-white">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Platform Impact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-3xl font-bold">25%</div>
                    <div className="text-blue-100">Resolution Rate</div>
                  </div>
                  <div className="text-center">
                    <Eye className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-3xl font-bold">50K+</div>
                    <div className="text-blue-100">Cases Viewed</div>
                  </div>
                  <div className="text-center">
                    <Heart className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-3xl font-bold">4.8</div>
                    <div className="text-blue-100">User Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Dashboard Section */}
      {activeTab === 'dashboard' && isAuthenticated && user && (
        <section className="container mx-auto px-4 py-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">My Cases</h2>
            <p className="text-gray-600">Track and manage your healthcare complaints</p>
          </div>
          
          <div className="mb-6">
            <Button onClick={handleFileCase} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg">
              <FileText className="h-4 w-4 mr-2" />
              File New Case
            </Button>
          </div>

          <CaseTrackingDashboard userId={user.id} />
        </section>
      )}

      {/* Admin Dashboard Section */}
      {activeTab === 'admin' && isAuthenticated && user && (user.role === 'ADMIN' || user.role === 'SUPERADMIN') && (
        <section className="container mx-auto px-4 py-16">
          <AdminDashboard adminId={user.id} userRole={user.role} />
        </section>
      )}

      {/* Public Cases Section */}
      {activeTab === 'public-cases' && (
        <section className="container mx-auto px-4 py-16">
          <PublicCasesBrowser
            isOpen={true}
            onClose={() => setShowPublicCases(false)}
          />
        </section>
      )}

      {/* Features Section */}
      {activeTab === 'features' && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Platform Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools for healthcare transparency and patient rights
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 group">
                  <CardHeader className="text-center pb-4">
                    <div className={`mx-auto mb-4 p-4 rounded-full bg-gradient-to-r ${feature.bgGradient}`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Issue Categories */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Reportable Issues
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {issueCategories.map((category, index) => (
                <Card key={index} className="hover:shadow-md transition-all duration-300 border border-gray-100">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{category}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      {activeTab === 'about' && (
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                About HealthRights
              </h2>
              <p className="text-xl text-gray-600">
                Empowering patients with transparency and accountability in healthcare
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-6 w-6 text-blue-600 mr-3" />
                    Our Mission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    To create a transparent healthcare ecosystem where patients can report issues, 
                    track progress, and access verified information to make informed decisions about their care.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      <span>File detailed cases with evidence</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      <span>Admin review for authenticity</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      <span>Public access to approved cases</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      <span>Real-time status updates</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of patients fighting for better healthcare
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={handleFileCase}
              className="bg-white text-blue-600 hover:bg-blue-50 border-2 border-white shadow-lg px-8 py-4 text-lg"
            >
              Get Started Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-blue-300 text-white hover:bg-blue-700 px-8 py-4 text-lg"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">HealthRights</span>
            </div>
            <div className="text-sm text-gray-600 text-center md:text-right">
              © 2024 HealthRights. All rights reserved. | 
              <Link href="#" className="hover:text-blue-600 ml-1">Privacy Policy</Link> | 
              <Link href="#" className="hover:text-blue-600 ml-1">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        onProfileRequired={handleProfileRequired}
      />

      <ProfileCompletionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userId={pendingUserId}
        phoneNumber={pendingPhoneNumber}
        onSuccess={handleProfileSuccess}
      />

      <ProfileSettings
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
      />

      {showCaseForm && isAuthenticated && user && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <CaseSubmissionForm
            key="case-form"
            onClose={() => setShowCaseForm(false)}
            onSuccess={handleCaseSubmitSuccess}
          />
        </div>
      )}
    );
}