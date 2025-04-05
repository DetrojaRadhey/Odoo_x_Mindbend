import { useLocation, useNavigate } from "react-router-dom";
import ShowServiceProvider from "@/components/ShowServiceProvider";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

export default function ServiceProvidersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { providers: initialProviders, requestTitle, requestVehicle, serviceId } = location.state || {};
  // Add state to manage providers
  const [providers, setProviders] = useState(initialProviders || []);
  console.log("Service ID:", serviceId);
  
  useEffect(() => {
    // Update providers when location state changes
    if (initialProviders) {
      setProviders(initialProviders);
    }
  }, [initialProviders]);

  // Function to handle when a provider is selected
  const handleProviderSelected = (providerId: string) => {
    // Remove the selected provider from the list
    setProviders(providers.filter(provider => provider._id !== providerId));
  };

  if (!providers || providers.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">No service providers found</h1>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          className="mr-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">
          Service Providers for {requestTitle}
        </h1>
      </div>
      
      <ShowServiceProvider 
        providers={providers}
        title={`Service Providers for ${requestTitle}`}
        requestVehicle={requestVehicle}
        serviceId={serviceId}
        onProviderSelected={handleProviderSelected}
      />
    </div>
  );
} 