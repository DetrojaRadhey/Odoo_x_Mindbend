
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useData } from "@/contexts/DataContext";
import { toast } from "@/lib/toast";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

const CreateEmergencyRequest = () => {
  const { createEmergencyRequest } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  
  useEffect(() => {
    // Get user's location when component mounts
    if (navigator.geolocation) {
      setLocationStatus('loading');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setLocationStatus('success');
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationStatus('error');
          toast.error("Failed to get your location. Please allow location access.");
        }
      );
    } else {
      setLocationStatus('error');
      toast.error("Geolocation is not supported by this browser.");
    }
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      toast.error("Unable to submit without location data.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createEmergencyRequest({
        latlon: location
      });
      
      toast.success("Emergency request created successfully!");
      // Close the dialog automatically
      const closeButton = document.querySelector('[data-state="open"] button.close-dialog');
      if (closeButton) {
        (closeButton as HTMLButtonElement).click();
      }
    } catch (error) {
      toast.error("Failed to create emergency request: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="bg-emergency/10 border border-emergency rounded-lg p-4">
        <h3 className="text-emergency font-medium mb-2">Important Notice</h3>
        <p className="text-sm">
          This will send an immediate emergency alert to nearby service providers.
          Use this only for urgent situations requiring immediate assistance.
        </p>
        <p className="text-sm mt-2">
          Your current location and contact information will be shared with service providers
          who accept your emergency request.
        </p>
      </div>
      
      <div className="bg-secondary/50 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <div className="w-3 h-3 rounded-full bg-emergency animate-pulse mr-2"></div>
          <p className="font-medium">Your emergency contacts will be notified</p>
        </div>
        <p className="text-sm text-muted-foreground">
          A message will be sent to all emergency contacts registered in your profile.
        </p>
      </div>
      
      {locationStatus === 'loading' && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
          <p>Obtaining your location...</p>
        </div>
      )}
      
      {locationStatus === 'error' && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-center">
          <p className="text-sm">Unable to get your location. Please enable location services.</p>
          <Button 
            type="button" 
            variant="outline" 
            className="mt-2"
            onClick={() => {
              setLocationStatus('loading');
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                  });
                  setLocationStatus('success');
                  toast.success("Location obtained successfully!");
                },
                () => {
                  setLocationStatus('error');
                  toast.error("Failed to get your location.");
                }
              );
            }}
          >
            Try Again
          </Button>
        </div>
      )}
      
      {locationStatus === 'success' && (
        <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 text-center">
          <p className="text-sm text-green-700">Location obtained successfully!</p>
        </div>
      )}
      
      <DialogFooter>
        <Button type="button" variant="outline" className="close-dialog" data-dismiss="dialog">
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="destructive" 
          disabled={isSubmitting || locationStatus !== 'success'}
        >
          {isSubmitting ? "Submitting..." : "Send Emergency Alert"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default CreateEmergencyRequest;
