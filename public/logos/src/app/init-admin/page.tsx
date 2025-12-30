'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Crown, Shield, CheckCircle, AlertTriangle, Users } from 'lucide-react';

export default function InitAdminPage() {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    fullName: '',
    email: '',
    address: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [superAdminExists, setSuperAdminExists] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkSuperAdminExists();
  }, []);

  const checkSuperAdminExists = async () => {
    try {
      const response = await fetch('/api/admin/init');
      const data = await response.json();
      
      if (data.success) {
        setSuperAdminExists(data.data.exists);
      }
    } catch (error) {
      console.error('Error checking super admin:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phoneNumber.trim() || !formData.fullName.trim() || !formData.address.trim()) {
      setError('Phone number, full name, and address are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber.trim(),
          fullName: formData.fullName.trim(),
          email: formData.email.trim() || null,
          address: formData.address.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setFormData({
          phoneNumber: '',
          fullName: '',
          email: '',
          address: ''
        });
        setSuperAdminExists(true);
      } else {
        setError(data.error || 'Failed to create super admin');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold mb-2">Checking System...</h2>
            <p className="text-gray-600">Verifying super admin status</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (superAdminExists) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Crown className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">System Initialized</h2>
            <p className="text-gray-600 mb-6">
              A Super Administrator already exists in the system.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Use the login button on the homepage to access your Super Admin account.
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Go to Homepage to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Crown className="h-16 w-16 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Initialize Super Admin
          </CardTitle>
          <CardDescription>
            Create the first Super Administrator for the Healthcare Transparency Platform
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This will create the system's first Super Administrator with full control over all users and settings.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="+1234567890"
                required
              />
            </div>

            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john.doe@example.com"
              />
            </div>

            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter complete address"
                rows={3}
                required
              />
            </div>

            {/* Success Message */}
            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              size="lg"
            >
              {loading ? 'Creating Super Admin...' : 'Create Super Admin'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Back to Homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}