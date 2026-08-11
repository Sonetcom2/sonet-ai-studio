export function isSuccessfulPayment(status: string) {
  return status === "success";
}

export function isDuplicatePayment(existing: any) {
  return !!existing;
}