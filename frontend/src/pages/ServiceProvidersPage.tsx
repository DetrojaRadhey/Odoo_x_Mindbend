import { useLocation, useNavigate } from "react-router-dom";
import ShowServiceProvider from "@/components/ShowServiceProvider";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ServiceProvidersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { providers, requestTitle } = location.state || {};
  console.log(providers);
  

  if (!providers) {
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
      />
    </div>
  );
} 