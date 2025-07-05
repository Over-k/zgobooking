"use client";

import { useState, useEffect } from "react";
import { PaymentMethod } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Trash2, CheckCircle, Plus } from "lucide-react";

export function PaymentMethodsForm() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isAddingBankAccount, setIsAddingBankAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/account/payment-methods');
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const data = await response.json();
      setPaymentMethods(data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const handleMakeDefault = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/account/payment-methods`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          isDefault: true
        })
      });

      if (!response.ok) throw new Error('Failed to update payment method');
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Error updating payment method:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/account/payment-methods`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      if (!response.ok) throw new Error('Failed to delete payment method');
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const cardholderName = formData.get('cardholderName') as string;
      const cardNumber = formData.get('cardNumber') as string;
      const expiryMonth = formData.get('expiryMonth') as string;
      const expiryYear = formData.get('expiryYear') as string;
      const cvc = formData.get('cvc') as string;

      if (!cardholderName || !cardNumber || !expiryMonth || !expiryYear || !cvc) {
        throw new Error('All fields are required');
      }

      const month = parseInt(expiryMonth);
      const year = parseInt(expiryYear);
      
      if (isNaN(month) || month < 1 || month > 12) {
        throw new Error('Invalid expiry month. Please enter a number between 01 and 12');
      }
      
      if (isNaN(year) || year < 2000 || year > 2100) {
        throw new Error('Invalid expiry year. Please enter a valid year');
      }

      const expiryDate = new Date(year, month - 1, 1);
      if (isNaN(expiryDate.getTime())) {
        throw new Error('Invalid expiry date. Please check your input');
      }

      const response = await fetch(`/api/account/payment-methods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: "credit_card",
          name: `${cardholderName} (${cardNumber.slice(-4)})`,
          lastFour: cardNumber.slice(-4),
          expiryDate: expiryDate.toISOString(),
          cardType: "visa",
          cardholderName,
          expiryMonth: parseInt(expiryMonth),
          expiryYear: parseInt(expiryYear)
        })
      });

      if (!response.ok) throw new Error('Failed to add payment method');
      await fetchPaymentMethods();
      setIsAddingCard(false);
    } catch (error) {
      console.error('Error adding payment method:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const response = await fetch(`/api/account/payment-methods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: "bank_account",
          name: formData.get('accountName') as string,
          lastFour: formData.get('accountNumber')?.toString().slice(-4) || '',
          accountNumber: formData.get('accountNumber') as string,
          routingNumber: formData.get('routingNumber') as string
        })
      });

      if (!response.ok) throw new Error('Failed to add payment method');
      await fetchPaymentMethods();
      setIsAddingBankAccount(false);
    } catch (error) {
      console.error('Error adding payment method:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Payment & Payout</h3>
        <p className="text-sm text-slate-500">
          Manage your payment methods and payout preferences
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="payment-methods" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="payout-preferences">
            Payout Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment-methods" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Payment Methods</CardTitle>
              <CardDescription>
                Manage credit cards, PayPal accounts, and other payment methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-slate-100 p-2">
                        <CreditCard className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium">{method.name}</p>
                        {method.expiryDate && (
                          <p className="text-sm text-slate-500">
                            Expires {new Date(method.expiryDate).toLocaleDateString('en-US', {
                              month: '2-digit',
                              year: '2-digit'
                            })}
                          </p>
                        )}
                        {method.isDefault && (
                          <span className="flex items-center text-sm text-green-600">
                            <CheckCircle className="mr-1 h-3 w-3" /> Default
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMakeDefault(method.id)}
                        >
                          Make Default
                        </Button>
                      )}
                      {paymentMethods.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer hover:bg-red-500 hover:text-white"
                          onClick={() => {
                            const confirmDelete = async () => {
                              try {
                                await handleDelete(method.id);
                              } catch (error) {
                                throw error;
                              }
                            };
                            confirmDelete();
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-slate-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {paymentMethods.length === 0 && (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-slate-500">
                      No payment methods added yet.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button className="w-full" onClick={() => setIsAddingCard(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Credit Card
              </Button>
              <Button className="w-full opacity-50 cursor-not-allowed" disabled>
                <Plus className="mr-2 h-4 w-4" /> Add PayPal
              </Button>
            </CardFooter>
          </Card>

          {isAddingCard && (
            <Card>
              <CardHeader>
                <CardTitle>Add Credit Card</CardTitle>
                <CardDescription>
                  Enter your credit card details securely
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCard} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardholderName">Cardholder Name</Label>
                       <Input
                         id="cardholderName"
                         name="cardholderName"
                         placeholder="John Doe"
                       />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                       <Input
                         id="cardNumber"
                         name="cardNumber"
                         placeholder="1234 5678 9012 3456"
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryMonth">Expiry Month</Label>
                         <Input
                           id="expiryMonth"
                           name="expiryMonth"
                           placeholder="MM"
                         />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiryYear">Expiry Year</Label>
                         <Input
                           id="expiryYear"
                           name="expiryYear"
                           placeholder="YYYY"
                         />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                       <Input
                         id="cvc"
                         name="cvc"
                         placeholder="123"
                       />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddingCard(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Add Card</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payout-preferences" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payout Methods</CardTitle>
              <CardDescription>
                Choose how you want to receive your earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup defaultValue="bank-account" className="space-y-4">
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="bank-account" id="bank-account" />
                  <Label
                    htmlFor="bank-account"
                    className="flex flex-1 items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        Bank Account (Direct Deposit)
                      </p>
                      <p className="text-sm text-slate-500">
                        Get paid directly to your bank account
                      </p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="paypal" id="paypal" disabled/>
                  <Label
                    htmlFor="paypal"
                    className="flex flex-1 items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">PayPal</p>
                      <p className="text-sm text-slate-500">
                        Get paid to your PayPal account
                      </p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {isAddingBankAccount ? (
                <div className="mt-6 space-y-4">
                  <h4 className="font-medium">Add Bank Account</h4>
                  <form onSubmit={handleAddBankAccount} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountName">Account Name</Label>
                        <Input id="accountName" placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input id="accountNumber" placeholder="XXXXXXXX" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="routingNumber">Routing Number</Label>
                        <Input id="routingNumber" placeholder="XXXXXXXXX" />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddingBankAccount(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Add Bank Account</Button>
                    </div>
                  </form>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="mt-6 w-full"
                  onClick={() => setIsAddingBankAccount(true)}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Bank Account
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payout Schedule</CardTitle>
              <CardDescription>
                Choose when you receive your payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup defaultValue="automatic" className="space-y-4">
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="automatic" id="automatic" />
                  <Label htmlFor="automatic" className="flex flex-1">
                    <div>
                      <p className="font-medium">Automatic (Default)</p>
                      <p className="text-sm text-slate-500">
                        Get paid automatically after each booking
                      </p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="flex flex-1">
                    <div>
                      <p className="font-medium">Monthly</p>
                      <p className="text-sm text-slate-500">
                        Combine all payouts into a monthly payment
                      </p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
            <CardFooter className="justify-end">
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
