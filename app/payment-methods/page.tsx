"use client";

import { useState, useEffect } from "react";
import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Smartphone, Building2, Wallet, Loader2, Save, Plus, Trash2, Edit } from "lucide-react";
import paymentMethodService, {
  type MobileMoneyMethod,
  type BankTransferMethod,
  type PaymentMethodsData,
} from "@/lib/services/payment-method.service";

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Mobile Money state
  const [mobileMoneyMethods, setMobileMoneyMethods] = useState<MobileMoneyMethod[]>([]);
  const [newMobileMoney, setNewMobileMoney] = useState<Partial<MobileMoneyMethod>>({
    provider: "mtn_momo",
    account_number: "",
    account_name: "",
    is_active: true,
  });

  // Bank Transfer state
  const [bankMethods, setBankMethods] = useState<BankTransferMethod[]>([]);
  const [newBank, setNewBank] = useState<Partial<BankTransferMethod>>({
    bank_name: "",
    account_number: "",
    account_name: "",
    branch: "",
    is_active: true,
  });

  // Cash settings state
  const [cashEnabled, setCashEnabled] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setIsLoading(true);
      const response = await paymentMethodService.getPaymentMethods();
      const methods = response.data;
      
      if (methods) {
        setPaymentMethods(methods);
        setMobileMoneyMethods(methods.mobile_money || []);
        setBankMethods(methods.bank_transfer || []);
        setCashEnabled(methods.cash_enabled || false);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to load payment methods");
    } finally {
      setIsLoading(false);
    }
  };

  // Mobile Money handlers
  const handleAddMobileMoney = async () => {
    if (!newMobileMoney.account_number || !newMobileMoney.account_name) {
      toast.error("Please fill in all mobile money fields");
      return;
    }

    try {
      setIsSaving(true);
      await paymentMethodService.addMobileMoneyMethod(newMobileMoney as Omit<MobileMoneyMethod, "id">);
      toast.success("Mobile money method added successfully");
      setNewMobileMoney({ provider: "mtn_momo", account_number: "", account_name: "", is_active: true });
      fetchPaymentMethods();
    } catch (error: any) {
      toast.error(error?.message || "Failed to add mobile money method");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateMobileMoney = async (id: number, data: Partial<MobileMoneyMethod>) => {
    try {
      setIsSaving(true);
      await paymentMethodService.updateMobileMoneyMethod(id, data);
      toast.success("Mobile money method updated successfully");
      fetchPaymentMethods();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update mobile money method");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMobileMoney = async (id: number) => {
    if (!confirm("Are you sure you want to delete this mobile money method?")) return;

    try {
      setIsSaving(true);
      await paymentMethodService.deleteMobileMoneyMethod(id);
      toast.success("Mobile money method deleted successfully");
      fetchPaymentMethods();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete mobile money method");
    } finally {
      setIsSaving(false);
    }
  };

  // Bank Transfer handlers
  const handleAddBank = async () => {
    if (!newBank.bank_name || !newBank.account_number || !newBank.account_name) {
      toast.error("Please fill in all bank account fields");
      return;
    }

    try {
      setIsSaving(true);
      await paymentMethodService.addBankTransferMethod(newBank as Omit<BankTransferMethod, "id">);
      toast.success("Bank account added successfully");
      setNewBank({ bank_name: "", account_number: "", account_name: "", branch: "", is_active: true });
      fetchPaymentMethods();
    } catch (error: any) {
      toast.error(error?.message || "Failed to add bank account");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateBank = async (id: number, data: Partial<BankTransferMethod>) => {
    try {
      setIsSaving(true);
      await paymentMethodService.updateBankTransferMethod(id, data);
      toast.success("Bank account updated successfully");
      fetchPaymentMethods();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update bank account");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBank = async (id: number) => {
    if (!confirm("Are you sure you want to delete this bank account?")) return;

    try {
      setIsSaving(true);
      await paymentMethodService.deleteBankTransferMethod(id);
      toast.success("Bank account deleted successfully");
      fetchPaymentMethods();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete bank account");
    } finally {
      setIsSaving(false);
    }
  };

  // Cash settings handler
  const handleToggleCash = async (enabled: boolean) => {
    try {
      setIsSaving(true);
      await paymentMethodService.updateCashSettings(enabled);
      setCashEnabled(enabled);
      toast.success(enabled ? "Cash payments enabled" : "Cash payments disabled");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update cash settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/50 dark:from-slate-900 dark:via-purple-900/20 dark:to-pink-900/30">
          <div className="container mx-auto p-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/50 dark:from-slate-900 dark:via-purple-900/20 dark:to-pink-900/30">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-purple-600 to-pink-600 dark:from-white dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Payment Methods
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage how tenants can pay their rent
              </p>
            </div>
          </div>

          <Tabs defaultValue="mobile-money" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mobile-money">
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile Money
              </TabsTrigger>
              <TabsTrigger value="bank-transfer">
                <Building2 className="h-4 w-4 mr-2" />
                Bank Transfer
              </TabsTrigger>
              <TabsTrigger value="cash">
                <Wallet className="h-4 w-4 mr-2" />
                Cash
              </TabsTrigger>
            </TabsList>

            {/* Mobile Money Tab */}
            <TabsContent value="mobile-money" className="space-y-6">
              {/* Add New Mobile Money */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Mobile Money Account
                  </CardTitle>
                  <CardDescription>Add a new mobile money account for receiving payments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mm-provider">Provider</Label>
                      <select
                        id="mm-provider"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        value={newMobileMoney.provider}
                        onChange={(e) => setNewMobileMoney(prev => ({ ...prev, provider: e.target.value as any }))}
                      >
                        <option value="mtn_momo">MTN Mobile Money</option>
                        <option value="vodafone_cash">Vodafone Cash</option>
                        <option value="airteltigo_money">AirtelTigo Money</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mm-number">Account Number *</Label>
                      <Input
                        id="mm-number"
                        value={newMobileMoney.account_number}
                        onChange={(e) => setNewMobileMoney(prev => ({ ...prev, account_number: e.target.value }))}
                        placeholder="024XXXXXXX"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="mm-name">Account Name *</Label>
                      <Input
                        id="mm-name"
                        value={newMobileMoney.account_name}
                        onChange={(e) => setNewMobileMoney(prev => ({ ...prev, account_name: e.target.value }))}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAddMobileMoney}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Mobile Money
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Mobile Money Methods */}
              <div className="space-y-4">
                {mobileMoneyMethods.map((method) => (
                  <Card key={method.id} className="shadow-md">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <Smartphone className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="font-semibold">
                                {method.provider === "mtn_momo" && "MTN Mobile Money"}
                                {method.provider === "vodafone_cash" && "Vodafone Cash"}
                                {method.provider === "airteltigo_money" && "AirtelTigo Money"}
                              </p>
                              <p className="text-sm text-muted-foreground">{method.account_number}</p>
                            </div>
                          </div>
                          <p className="text-sm">{method.account_name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={method.is_active}
                            onCheckedChange={(checked) => handleUpdateMobileMoney(Number(method.id), { is_active: checked })}
                            disabled={isSaving}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMobileMoney(Number(method.id))}
                            disabled={isSaving}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {mobileMoneyMethods.length === 0 && (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No mobile money accounts added yet
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Bank Transfer Tab */}
            <TabsContent value="bank-transfer" className="space-y-6">
              {/* Add New Bank Account */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Bank Account
                  </CardTitle>
                  <CardDescription>Add a new bank account for receiving payments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank-name">Bank Name *</Label>
                      <Input
                        id="bank-name"
                        value={newBank.bank_name}
                        onChange={(e) => setNewBank(prev => ({ ...prev, bank_name: e.target.value }))}
                        placeholder="e.g., GCB Bank"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bank-number">Account Number *</Label>
                      <Input
                        id="bank-number"
                        value={newBank.account_number}
                        onChange={(e) => setNewBank(prev => ({ ...prev, account_number: e.target.value }))}
                        placeholder="XXXXXXXXXXXX"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bank-acc-name">Account Name *</Label>
                      <Input
                        id="bank-acc-name"
                        value={newBank.account_name}
                        onChange={(e) => setNewBank(prev => ({ ...prev, account_name: e.target.value }))}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bank-branch">Branch (Optional)</Label>
                      <Input
                        id="bank-branch"
                        value={newBank.branch}
                        onChange={(e) => setNewBank(prev => ({ ...prev, branch: e.target.value }))}
                        placeholder="e.g., Osu Branch"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAddBank}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bank Account
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Bank Accounts */}
              <div className="space-y-4">
                {bankMethods.map((method) => (
                  <Card key={method.id} className="shadow-md">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <Building2 className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="font-semibold">{method.bank_name}</p>
                              <p className="text-sm text-muted-foreground">{method.account_number}</p>
                            </div>
                          </div>
                          <p className="text-sm">{method.account_name}</p>
                          {method.branch && (
                            <p className="text-xs text-muted-foreground">Branch: {method.branch}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={method.is_active}
                            onCheckedChange={(checked) => handleUpdateBank(Number(method.id), { is_active: checked })}
                            disabled={isSaving}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBank(Number(method.id))}
                            disabled={isSaving}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {bankMethods.length === 0 && (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No bank accounts added yet
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Cash Tab */}
            <TabsContent value="cash" className="space-y-6">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Cash Payments
                  </CardTitle>
                  <CardDescription>
                    Enable or disable cash payments from tenants
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">Accept Cash Payments</p>
                      <p className="text-sm text-muted-foreground">
                        Allow tenants to pay rent in cash
                      </p>
                    </div>
                    <Switch
                      checked={cashEnabled}
                      onCheckedChange={handleToggleCash}
                      disabled={isSaving}
                    />
                  </div>

                  {cashEnabled && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        <strong>Note:</strong> When cash payments are enabled, tenants can record cash payments in the system. 
                        You will need to manually verify these payments.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
