import PaystackPop from "@paystack/inline-js";

type InitializePaymentProps = {
  email: string;
  amount: number;
  reference: string;
  onSuccess: (reference: string) => void;
};

export function initializePayment({
  email,
  amount,
  reference,
  onSuccess,
}: InitializePaymentProps) {
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