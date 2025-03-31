
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { User, ServiceProvider } from "@/types";
import { toast } from "@/lib/toast";

const Profile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [newContact, setNewContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please log in to view your profile</p>
      </div>
    );
  }

  // Add type guards to properly handle user vs service provider types
  const isServiceProvider = currentUser.userType === 'service_provider';
  
  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      // Pre-populate form data with current user data
      if (!isServiceProvider) {
        const user = currentUser as User;
        setFormData({
          name: user.name,
          mobile: user.mobile,
          location: { ...user.location },
          other_contact: [...user.other_contact]
        });
      }
      setIsEditing(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "city" || name === "district" || name === "state") {
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [name]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAddContact = () => {
    if (!formData.other_contact) {
      formData.other_contact = [];
    }
    
    if (newContact && /^\d{10}$/.test(newContact) && formData.other_contact.length < 5) {
      setFormData({
        ...formData,
        other_contact: [...formData.other_contact, newContact]
      });
      setNewContact("");
    } else {
      toast.error("Please enter a valid 10-digit contact number");
    }
  };

  const handleRemoveContact = (index: number) => {
    const updatedContacts = [...formData.other_contact!];
    updatedContacts.splice(index, 1);
    setFormData({
      ...formData,
      other_contact: updatedContacts
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isServiceProvider) {
        throw new Error("Service providers cannot update their profile");
      }
      
      // Validate mobile number
      if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
        throw new Error("Mobile number must be 10 digits");
      }
      
      // Make API call to update user profile
      await updateUserProfile(formData);
      
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
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
                    <CardTitle>{currentUser.name}</CardTitle>
                    <CardDescription>
                      {isServiceProvider ? "Service Provider" : "User"} • Member since {new Date().getFullYear()}
                    </CardDescription>
                  </div>
                  {!isServiceProvider && (
                    <Button variant="outline" size="sm" onClick={handleEditToggle}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
                  <p>{currentUser.email}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Phone</h3>
                  <p>
                    {isServiceProvider 
                      ? ((currentUser as ServiceProvider).contact?.mobile?.[0] || "Not provided")
                      : (currentUser as User).mobile}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Location</h3>
                  <p>
                    {currentUser.location.city}, {currentUser.location.district}, {currentUser.location.state}
                  </p>
                </div>
                
                {!isServiceProvider && (
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Emergency Contacts</h3>
                    {(currentUser as User).other_contact && (currentUser as User).other_contact.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {(currentUser as User).other_contact.map((contact, index) => (
                          <li key={index}>{contact}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No emergency contacts provided</p>
                    )}
                  </div>
                )}
                
                {isServiceProvider && (
                  <>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Service Type</h3>
                      <p>{(currentUser as ServiceProvider).type}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Address</h3>
                      <p>
                        {isServiceProvider && (currentUser as ServiceProvider).location.address ? 
                          (currentUser as ServiceProvider).location.address : 
                          "No specific address provided"}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Rating</h3>
                      <p>{(currentUser as ServiceProvider).rating}/5 ⭐</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground">Services Completed</h3>
                      <p>{(currentUser as ServiceProvider).service_count}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <Input 
                      id="name"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="mobile" className="text-sm font-medium">Mobile Number</label>
                    <Input 
                      id="mobile"
                      name="mobile"
                      value={formData.mobile || ""}
                      onChange={handleInputChange}
                      className="mt-1"
                      maxLength={10}
                    />
                    <p className="text-xs text-muted-foreground mt-1">10 digits only</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="state" className="text-sm font-medium">State</label>
                      <Input 
                        id="state"
                        name="state"
                        value={formData.location?.state || ""}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="district" className="text-sm font-medium">District</label>
                      <Input 
                        id="district"
                        name="district"
                        value={formData.location?.district || ""}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="text-sm font-medium">City</label>
                      <Input 
                        id="city"
                        name="city"
                        value={formData.location?.city || ""}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Emergency Contacts</label>
                    {formData.other_contact && formData.other_contact.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {formData.other_contact.map((contact, index) => (
                          <div key={index} className="flex items-center justify-between bg-secondary rounded-md p-2">
                            <span>{contact}</span>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveContact(index)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">No emergency contacts added</p>
                    )}
                    
                    {(!formData.other_contact || formData.other_contact.length < 5) && (
                      <div className="flex space-x-2 mt-2">
                        <Input 
                          placeholder="Add emergency contact"
                          value={newContact}
                          onChange={(e) => setNewContact(e.target.value)}
                          maxLength={10}
                        />
                        <Button 
                          type="button" 
                          variant="secondary" 
                          onClick={handleAddContact}
                        >
                          Add
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">You can add up to 5 emergency contacts</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                  >
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
