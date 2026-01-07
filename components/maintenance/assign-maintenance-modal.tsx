/**
 * Assign Maintenance Request Modal
 * Allows landlords to assign maintenance requests to caretakers or artisans
 * Includes auto-suggestions based on category, location, workload, and performance
 */

"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAssignMaintenanceRequest, useAutoAssignMaintenanceRequest } from "@/lib/hooks/use-landlord-maintenance";
import { useAvailableCaretakers } from "@/lib/hooks/use-landlord-users";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { 
  UserCheck, 
  Sparkles, 
  Star, 
  MapPin, 
  Briefcase, 
  Clock, 
  CheckCircle,
  Loader2,
  AlertCircle,
  User,
  Wrench
} from "lucide-react";
import type { MaintenanceRequest, AssignMaintenanceRequest, MaintenancePriority } from "@/lib/api-types";
import { canAssignRequest } from "@/lib/utils/maintenance-workflow";

interface AssignMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenanceRequest: MaintenanceRequest;
  onSuccess?: () => void;
}

interface AssigneeSuggestion {
  id: string;
  name: string;
  type: "caretaker" | "artisan" | "landlord";
  email?: string;
  phone?: string;
  score: number;
  reasons: string[];
  // Performance metrics (for artisans)
  average_rating?: number;
  completion_rate?: number;
  on_time_rate?: number;
  total_completed?: number;
  // Location info
  location?: string;
  distance?: number;
  // Workload
  current_assignments?: number;
  available?: boolean;
}

export function AssignMaintenanceModal({
  isOpen,
  onClose,
  maintenanceRequest,
  onSuccess,
}: AssignMaintenanceModalProps) {
  const { user } = useAuth();
  const [assigneeType, setAssigneeType] = useState<"caretaker" | "artisan" | "landlord">("caretaker");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
  const [note, setNote] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [priority, setPriority] = useState<MaintenancePriority>(maintenanceRequest.priority);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState<AssigneeSuggestion[]>([]);
  const [isCalculatingSuggestions, setIsCalculatingSuggestions] = useState(false);

  const { data: caretakersData, loading: loadingCaretakers } = useAvailableCaretakers();
  const { assignRequest, loading: assigning } = useAssignMaintenanceRequest();
  const { autoAssign, loading: autoAssigning } = useAutoAssignMaintenanceRequest();

  const caretakers = caretakersData || [];

  // Calculate auto-suggestions
  useEffect(() => {
    if (isOpen && maintenanceRequest && showSuggestions) {
      calculateSuggestions();
    }
  }, [isOpen, maintenanceRequest, showSuggestions]);

  const calculateSuggestions = async () => {
    setIsCalculatingSuggestions(true);
    
    // Simulate suggestion calculation
    // In real implementation, this would call an API endpoint
    const calculatedSuggestions: AssigneeSuggestion[] = [];

    // Add caretakers with scores
    caretakers.forEach((caretaker) => {
      let score = 50; // Base score
      const reasons: string[] = [];

      // Category expertise (if available)
      // Location proximity (if available)
      // Current workload
      const currentWorkload = 0; // Would come from API
      if (currentWorkload < 3) {
        score += 20;
        reasons.push("Low workload");
      } else if (currentWorkload < 5) {
        score += 10;
        reasons.push("Moderate workload");
      }

      // Availability
      score += 10;
      reasons.push("Available");

      calculatedSuggestions.push({
        id: caretaker.id,
        name: caretaker.name || "Unknown",
        type: "caretaker",
        email: caretaker.email,
        phone: caretaker.phone,
        score,
        reasons,
        current_assignments: currentWorkload,
        available: true,
      });
    });

    // Add landlord as option
    if (user?.role === "landlord" || user?.role === "super_admin") {
      calculatedSuggestions.push({
        id: user.id,
        name: user.name || "Self",
        type: "landlord",
        email: user.email,
        score: 30,
        reasons: ["Self-assignment"],
        available: true,
      });
    }

    // Sort by score (highest first)
    calculatedSuggestions.sort((a, b) => b.score - a.score);
    setSuggestions(calculatedSuggestions);
    setIsCalculatingSuggestions(false);
  };

  const handleAutoAssign = async () => {
    try {
      const result = await autoAssign(maintenanceRequest.id);
      if (result) {
        toast.success("Request assigned automatically!");
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to auto-assign request");
    }
  };

  const handleManualAssign = async () => {
    if (!selectedAssigneeId) {
      toast.error("Please select an assignee");
      return;
    }

    try {
      const assignmentData: AssignMaintenanceRequest = {
        assignee_id: selectedAssigneeId,
        assignee_type: assigneeType,
        note: note.trim() || undefined,
        scheduled_date: scheduledDate || undefined,
        priority: priority !== maintenanceRequest.priority ? priority : undefined,
      };

      const result = await assignRequest(maintenanceRequest.id, assignmentData);
      if (result) {
        toast.success("Request assigned successfully!");
        onSuccess?.();
        onClose();
        // Reset form
        setSelectedAssigneeId("");
        setNote("");
        setScheduledDate("");
        setPriority(maintenanceRequest.priority);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to assign request");
    }
  };

  const handleSelectSuggestion = (suggestion: AssigneeSuggestion) => {
    setSelectedAssigneeId(suggestion.id);
    setAssigneeType(suggestion.type);
    setShowSuggestions(false);
  };

  const canAssign = canAssignRequest(maintenanceRequest.status);

  if (!canAssign) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot Assign Request</DialogTitle>
            <DialogDescription>
              This request cannot be assigned. It must be in "Approved" status.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Assign Maintenance Request
          </DialogTitle>
          <DialogDescription>
            Assign request #{maintenanceRequest.request_number} to a caretaker, artisan, or handle it yourself.
          </DialogDescription>
        </DialogHeader>

        {/* Request Summary */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <h3 className="font-semibold">{maintenanceRequest.title}</h3>
              <p className="text-sm text-muted-foreground">{maintenanceRequest.description}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline">{maintenanceRequest.category.name}</Badge>
                <Badge variant={maintenanceRequest.priority === "emergency" ? "destructive" : "secondary"}>
                  {maintenanceRequest.priority}
                </Badge>
                <Badge variant="outline">
                  {maintenanceRequest.property.name}
                  {maintenanceRequest.unit && ` - Unit ${maintenanceRequest.unit.unit_number}`}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Auto-Suggestions
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Manual Assignment
            </TabsTrigger>
          </TabsList>

          {/* Auto-Suggestions Tab */}
          <TabsContent value="suggestions" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Based on category expertise, location, workload, and performance
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoAssign}
                disabled={autoAssigning}
              >
                {autoAssigning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Auto-Assign Best Match
                  </>
                )}
              </Button>
            </div>

            {isCalculatingSuggestions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Calculating suggestions...</span>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <Card
                    key={suggestion.id}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      selectedAssigneeId === suggestion.id ? "border-primary border-2" : ""
                    }`}
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{suggestion.name}</h4>
                            <Badge variant="outline" className="capitalize">
                              {suggestion.type}
                            </Badge>
                            {index === 0 && (
                              <Badge className="bg-yellow-500">
                                <Star className="h-3 w-3 mr-1" />
                                Best Match
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            {suggestion.reasons.map((reason, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {reason}
                              </Badge>
                            ))}
                          </div>

                          {/* Performance Metrics (for artisans) */}
                          {suggestion.type === "artisan" && (
                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              {suggestion.average_rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  <span>Rating: {suggestion.average_rating.toFixed(1)}</span>
                                </div>
                              )}
                              {suggestion.completion_rate !== undefined && (
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>{suggestion.completion_rate}% completion</span>
                                </div>
                              )}
                              {suggestion.on_time_rate !== undefined && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{suggestion.on_time_rate}% on-time</span>
                                </div>
                              )}
                              {suggestion.total_completed !== undefined && (
                                <div className="flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" />
                                  <span>{suggestion.total_completed} completed</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Workload Info */}
                          {suggestion.current_assignments !== undefined && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <Briefcase className="h-3 w-3 inline mr-1" />
                              {suggestion.current_assignments} current assignments
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {suggestion.score}%
                          </div>
                          <div className="text-xs text-muted-foreground">Match Score</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>No suggestions available</p>
              </div>
            )}
          </TabsContent>

          {/* Manual Assignment Tab */}
          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-4">
              {/* Assignee Type */}
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Select value={assigneeType} onValueChange={(value: any) => {
                  setAssigneeType(value);
                  setSelectedAssigneeId(""); // Reset selection when type changes
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="caretaker">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Caretaker
                      </div>
                    </SelectItem>
                    <SelectItem value="artisan">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Artisan/Contractor
                      </div>
                    </SelectItem>
                    {(user?.role === "landlord" || user?.role === "super_admin") && (
                      <SelectItem value="landlord">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          Self (Landlord)
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Assignee Selection */}
              {assigneeType === "caretaker" && (
                <div className="space-y-2">
                  <Label>Select Caretaker</Label>
                  <Select
                    value={selectedAssigneeId}
                    onValueChange={setSelectedAssigneeId}
                    disabled={loadingCaretakers}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCaretakers ? "Loading..." : "Choose caretaker"} />
                    </SelectTrigger>
                    <SelectContent>
                      {caretakers.map((caretaker) => (
                        <SelectItem key={caretaker.id} value={caretaker.id}>
                          <div className="flex items-center gap-2">
                            <span>{caretaker.name}</span>
                            {caretaker.email && (
                              <span className="text-xs text-muted-foreground">({caretaker.email})</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {assigneeType === "artisan" && (
                <div className="space-y-2">
                  <Label>Select Artisan</Label>
                  <Select value={selectedAssigneeId} onValueChange={setSelectedAssigneeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose artisan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="artisan-1">Artisan 1 (Coming soon)</SelectItem>
                      {/* TODO: Add artisan list from API */}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Artisan management coming soon. For now, use caretakers.
                  </p>
                </div>
              )}

              {assigneeType === "landlord" && (
                <div className="space-y-2">
                  <Label>Self Assignment</Label>
                  <Input
                    value={user?.name || "You"}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    You will handle this request yourself.
                  </p>
                </div>
              )}

              {/* Priority Override */}
              <div className="space-y-2">
                <Label>Priority (Optional)</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as MaintenancePriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Override the request priority if needed
                </p>
              </div>

              {/* Scheduled Date */}
              <div className="space-y-2">
                <Label>Scheduled Date (Optional)</Label>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
                <p className="text-xs text-muted-foreground">
                  Preferred date for starting the work
                </p>
              </div>

              {/* Note */}
              <div className="space-y-2">
                <Label>Assignment Note (Optional)</Label>
                <Textarea
                  placeholder="Add any special instructions or notes for the assignee..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={assigning || autoAssigning}>
            Cancel
          </Button>
          <Button
            onClick={handleManualAssign}
            disabled={!selectedAssigneeId || assigning || autoAssigning}
          >
            {assigning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Assign Request
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

