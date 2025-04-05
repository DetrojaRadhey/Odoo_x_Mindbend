import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { User, ServiceProvider } from "@/types";
import { toast } from "@/lib/toast";
import axios from "axios";

const Profile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    mobile: '',
    location: {
      state: '',
      district: '',
      city: '',
      address: ''
    },
    other_contact: []
  });
  const [newContact, setNewContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when currentUser changes
  useEffect(() => {
    if (currentUser && !isServiceProvider) {
      const user = currentUser as User;
      setFormData({
        name: user.name || '',
        mobile: user.mobile || '',
        location: {
          state: user.location?.state || '',
          district: user.location?.district || '',
          city: user.location?.city || '',
          address: user.location?.address || ''
        },
        other_contact: user.other_contact || []
      });
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please log in to view your profile</p>
      </div>
    );
  }

  // Add type guards to properly handle user vs service provider types
  const isServiceProvider = currentUser.role === 'service_provider';
  
  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "city" || name === "district" || name === "state" || name === "address") {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddContact = () => {
    if (!formData.other_contact) {
      formData.other_contact = [];
    }
    
    if (newContact && /^\d{10}$/.test(newContact) && formData.other_contact.length < 5) {
      setFormData(prev => ({
        ...prev,
        other_contact: [...(prev.other_contact || []), newContact]
      }));
      setNewContact("");
    } else {
      toast.error("Please enter a valid 10-digit contact number");
    }
  };

  const handleRemoveContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      other_contact: prev.other_contact?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (currentUser.role !== 'user') {
        throw new Error("Only users can update their profile");
      }
      
      // Validate mobile number
      if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
        throw new Error("Mobile number must be 10 digits");
      }

      // Validate required fields
      if (!formData.name || !formData.mobile || !formData.location?.state || 
          !formData.location?.district || !formData.location?.city) {
        throw new Error("Please fill in all required fields");
      }
      
      // Make API call to update user profile
      const response = await axios.put(
        'http://localhost:3000/api/users/profile',
        {
          name: formData.name,
          mobile: formData.mobile,
          location: {
            state: formData.location.state,
            district: formData.location.district,
            city: formData.location.city
          },
          other_contact: formData.other_contact || []
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true // Important for sending cookies
        }
      );

      if (response.data.success) {
        // Update local state with the response data
        const updatedUser = {
          ...currentUser,
          ...response.data.data.user
        };
        
        // Update the user data in AuthContext
        await updateUserProfile(updatedUser);
        
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {!isEditing ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{currentUser.name || 'No name provided'}</CardTitle>
                    <CardDescription>
                      {currentUser.role === 'admin' ? "Admin" : 
                       currentUser.role === 'service_provider' ? "Service Provider" : 
                       "User"} • Member since {new Date().getFullYear()}
                    </CardDescription>
                  </div>
                  {currentUser.role === 'user' && (
                    <Button variant="outline" size="sm" onClick={handleEditToggle}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
                  <p>{currentUser.name || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
                  <p>{currentUser.email || 'Not provided'}</p>
                </div>

                {currentUser.role === 'admin' && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Role</h3>
                    <p>{currentUser.role}</p>
                  </div>
                )}

                {currentUser.role === 'service_provider' && (
                  <>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Service Type</h3>
                      <p>{(currentUser as ServiceProvider).type || 'Not specified'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Contact</h3>
                      <p>{(currentUser as ServiceProvider).contact?.mobile || 'Not provided'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Location</h3>
                      <p>State: {(currentUser as ServiceProvider).location?.state || 'Not provided'}</p>
                      <p>District: {(currentUser as ServiceProvider).location?.district || 'Not provided'}</p>
                      <p>City: {(currentUser as ServiceProvider).location?.city || 'Not provided'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Rating</h3>
                      <p>{(currentUser as ServiceProvider).rating || 0}/5 ⭐</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Services Completed</h3>
                      <p>{(currentUser as ServiceProvider).service_count || 0}</p>
                    </div>
                  </>
                )}

                {currentUser.role === 'user' && (
                  <>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Mobile</h3>
                      <p>{(currentUser as User).mobile || 'Not provided'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Location</h3>
                      <p>State: {(currentUser as User).location?.state || 'Not provided'}</p>
                      <p>District: {(currentUser as User).location?.district || 'Not provided'}</p>
                      <p>City: {(currentUser as User).location?.city || 'Not provided'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Emergency Contacts</h3>
                      {(currentUser as User).other_contact?.length > 0 ? (
                        <ul className="list-disc list-inside">
                          {(currentUser as User).other_contact.map((contact, index) => (
                            <li key={index}>{contact}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>No emergency contacts provided</p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mobile</label>
                    <Input
                      name="mobile"
                      value={formData.mobile || ''}
                      onChange={handleInputChange}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City</label>
                      <Input
                        name="city"
                        value={formData.location?.city || ''}
                        onChange={handleInputChange}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">District</label>
                      <Input
                        name="district"
                        value={formData.location?.district || ''}
                        onChange={handleInputChange}
                        placeholder="District"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">State</label>
                      <Input
                        name="state"
                        value={formData.location?.state || ''}
                        onChange={handleInputChange}
                        placeholder="State"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Emergency Contacts</label>
                    <div className="flex gap-2">
                      <Input
                        value={newContact}
                        onChange={(e) => setNewContact(e.target.value)}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                      />
                      <Button type="button" onClick={handleAddContact}>
                        Add
                      </Button>
                    </div>
                    {formData.other_contact && formData.other_contact.length > 0 && (
                      <ul className="mt-2 space-y-2">
                        {formData.other_contact.map((contact, index) => (
                          <li key={index} className="flex items-center justify-between">
                            <span>{contact}</span>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveContact(index)}
                            >
                              Remove
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={handleEditToggle}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Account management features will be available in future updates.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
