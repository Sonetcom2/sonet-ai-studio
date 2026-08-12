type InitializePaymentProps = {
  email: string;
  amount: number;
  reference: string;
  onSuccess: (reference: string) => void;
};

export async function initializePayment({
  email,
  amount,
  reference,
  onSuccess,
}: InitializePaymentProps) {
  if (typeof window === "undefined") {
    throw new Error("Payment can only be initialized in the browser.");
  }

  const { default: PaystackPop } = await import("@paystack/inline-js");

  const popup = new PaystackPop();

  popup.newTransaction({
    key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    email,
    amount,
    reference,

    onSuccess(transaction: any) {
      onSuccess(transaction.reference);
    },

    onCancel() {
      console.log("Payment cancelled");
    },
  });
}