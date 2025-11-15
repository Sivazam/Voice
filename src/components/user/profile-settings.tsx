'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, MapPin, Phone, Edit, Camera, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { User as UserType } from '@/types';

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSettings({ isOpen, onClose }: ProfileSettingsProps) {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    address: user?.address || '',
    profilePictureUrl: user?.profilePictureUrl || ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    if (!formData.fullName.trim() || !formData.address.trim()) {
      setError('Full name and address are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Get current user from auth store
      const currentUser = user;
      if (!currentUser || !currentUser.id) {
        throw new Error('User not authenticated');
      }

      // Update user profile via API
      const response = await fetch('/api/auth/update-profile', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.id}` // Add user ID to headers
        },
        body: JSON.stringify({
          userId: currentUser.id, // Also include in body
          fullName: formData.fullName.trim(),
          email: formData.email.trim() || null,
          address: formData.address.trim(),
          profilePictureUrl: formData.profilePictureUrl || null
        })
      });

      const data = await response.json();

      if (data.success) {
        updateUser(data.data);
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      address: user?.address || '',
      profilePictureUrl: user?.profilePictureUrl || ''
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload to Firebase Storage
      // For demo purposes, we'll create a local URL
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, profilePictureUrl: url }));
    }
  };

  const handleRemoveAvatar = () => {
    setFormData(prev => ({ ...prev, profilePictureUrl: '' }));
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <span className="text-xl font-semibold">Profile Settings</span>
          </DialogTitle>
          <DialogDescription>
            Manage your personal information and preferences
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Profile Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="h-16 w-16">
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{user.fullName}</h3>
                    <Badge className={user.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-800' : user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                      {user.role === 'SUPERADMIN' ? 'Super Admin' : user.role === 'ADMIN' ? 'Admin' : 'User'}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    onClick={isEditing ? handleCancel : handleEdit}
                    className="flex-1"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                  {isEditing && (
                    <Button
                      variant="default"
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Profile Picture Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 text-blue-600 mr-2" />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="h-20 w-20">
                        <User className="h-10 w-10" />
                      </AvatarFallback>
                    </Avatar>
                    {formData.profilePictureUrl && (
                      <div className="absolute bottom-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        ✓ Uploaded
                      </div>
                    )}
                  </div>
                  <div>
                    {formData.profilePictureUrl ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveAvatar}
                        className="text-red-600 hover:text-red-700"
                        disabled={!isEditing}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        className="text-blue-600 hover:text-blue-700"
                        disabled={!isEditing}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Upload Photo
                      </Button>
                    )}
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      disabled={!isEditing}
                      className={isEditing ? 'border-blue-500' : ''}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className={isEditing ? 'border-blue-500' : ''}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={!isEditing}
                    className={isEditing ? 'border-blue-500' : ''}
                    placeholder="Enter your complete address"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={user.phoneNumber}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
                </div>
              </CardContent>
            </Card>

            {/* Role Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-600 mr-2" />
                  Role Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Badge className={user.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-800' : user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                      {user.role === 'SUPERADMIN' ? 'Super Admin' : user.role === 'ADMIN' ? 'Admin' : 'User'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Member since: {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total cases filed: {user.totalCasesFiled}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Message */}
            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex justify-end space-x-2 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {isEditing && (
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}