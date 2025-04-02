import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, MapPin, Star } from "lucide-react";

interface ServiceProviderContact {
  mobile: string;
  email: string;
}

interface ServiceProvider {
  _id: string;
  name: string;
  contact: ServiceProviderContact;
  location?: string;
  rating?: number;
  isAvailable?: boolean;
}

interface ShowServiceProviderProps {
  providers: ServiceProvider[];
  title?: string;
}

export default function ShowServiceProvider({ providers, title = "Service Providers" }: ShowServiceProviderProps) {
  if (!providers || providers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((provider) => (
          <Card key={provider._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">{provider.name}</CardTitle>
              {provider.isAvailable !== undefined && (
                <Badge variant={provider.isAvailable ? "default" : "destructive"}>
                  {provider.isAvailable ? "Available" : "Unavailable"}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Contact Information */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{provider.contact.mobile}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">{provider.contact.email}</span>
                  </div>
                </div>

                {/* Location */}
                {provider.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span className="text-sm">{provider.location}</span>
                  </div>
                )}

                {/* Rating */}
                {provider.rating !== undefined && (
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm">{provider.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
