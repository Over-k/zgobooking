import { PaymentMethod } from "@prisma/client";

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "pm1",
    type: "credit_card",
    name: "Visa ending in 4242",
    lastFour: "4242",
    expiryDate: new Date("2026-12-31"),
    cardType: "visa",
    cardholderName: "John Doe",
    expiryMonth: 12,
    expiryYear: 2026,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    isDefault: true,
    userId: "user-1"
  },
  {
    id: "pm2",
    type: "credit_card",
    name: "Mastercard ending in 5555",
    lastFour: "5555",
    expiryDate: new Date("2025-11-30"),
    cardType: "mastercard",
    cardholderName: "Jane Smith",
    expiryMonth: 11,
    expiryYear: 2025,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    isDefault: false,
    userId: "user-2"
  },
  {
    id: "pm3",
    type: "paypal",
    name: "PayPal Account",
    lastFour: null,
    expiryDate: null,
    cardType: null,
    cardholderName: "Alice Johnson",
    expiryMonth: null,
    expiryYear: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    isDefault: true,
    userId: "user-3"
  }
];