// src/app/account/payments/page.tsx
import { PaymentMethodsForm } from "@/components/account/payment-methods";

export const metadata = {
  title: "Payment & Payout",
  description: "Manage your payment methods and payout preferences",
};

export default function PaymentsPage() {
  return <PaymentMethodsForm />;
}
