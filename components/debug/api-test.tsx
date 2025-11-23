"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { landlordPropertyService } from "@/lib/services/landlord-property.service";
import { toast } from "sonner";
import config from "@/lib/config";

export function ApiTestComponent() {
  const [properties, setProperties] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testLoadProperties = async () => {
    try {
      setLoading(true);
      console.log("Testing property loading...");
      const response = await landlordPropertyService.getProperties();
      console.log("Properties response:", response);
      setProperties(response.data || []);
      toast.success(`Loaded ${response.data?.length || 0} properties`);
    } catch (error) {
      console.error("Error loading properties:", error);
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const testLoadUnits = async (propertyId: string) => {
    try {
      setLoading(true);
      console.log("Testing unit loading for property:", propertyId);
      const response = await landlordPropertyService.getPropertyUnits(propertyId);
      console.log("Units response:", response);
      setUnits(response.data || []);
      toast.success(`Loaded ${response.data?.length || 0} units`);
    } catch (error) {
      console.error("Error loading units:", error);
      toast.error("Failed to load units");
    } finally {
      setLoading(false);
    }
  };

  const testBackendConnection = () => {
    const testUrl = config.api.baseUrl.replace('/api', '');
    window.open(testUrl, '_blank');
    toast.info(`Opening ${testUrl} in new tab to test backend connection`);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>API Debug Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Configuration Info */}
        <div className="bg-muted p-3 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">Current API Configuration:</h4>
          <p className="text-xs font-mono">Base URL: {config.api.baseUrl}</p>
          <p className="text-xs font-mono">Properties Endpoint: {config.api.baseUrl}/properties</p>
          <p className="text-xs text-muted-foreground">
            If this URL is wrong, create/update .env.local with NEXT_PUBLIC_API_BASE_URL
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={testBackendConnection}
            className="text-xs"
          >
            Test Backend Connection
          </Button>
        </div>

        <div className="space-y-2">
          <Button onClick={testLoadProperties} disabled={loading}>
            {loading ? "Loading..." : "Test Load Properties"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Properties loaded: {properties.length}
          </p>
        </div>

        {properties.length > 0 && (
          <div className="space-y-2">
            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger>
                <SelectValue placeholder="Select a property to test units" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedProperty && (
          <div className="space-y-2">
            <Button 
              onClick={() => testLoadUnits(selectedProperty)} 
              disabled={loading}
            >
              {loading ? "Loading..." : "Test Load Units"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Units loaded: {units.length}
            </p>
          </div>
        )}

        {units.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Units Data:</h4>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(units, null, 2)}
            </pre>
          </div>
        )}

        {properties.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Properties Data:</h4>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(properties, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
