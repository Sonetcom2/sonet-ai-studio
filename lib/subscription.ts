export function getSubscriptionDetails(plan: string) {
  switch (plan) {
    case "PRO":
      return {
        plan: "PRO",
        credits: 1000,
      };

    case "PREMIUM":
      return {
        plan: "PREMIUM",
        credits: 999999,
      };

    default:
      return {
        plan: "FREE",
        credits: 100,
      };
  }
}