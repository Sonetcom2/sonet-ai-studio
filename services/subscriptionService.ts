
import { getSettings } from "@/services/settingsService";

export async function getPlanDetails(plan: string) {
  const settings = await getSettings();

  switch (plan.toUpperCase()) {
    case "PRO":
      return {
        plan: "PRO",
        credits: settings.pro_credits,
      };

    case "PREMIUM":
      return {
        plan: "PREMIUM",
        credits: settings.premium_credits,
      };

    default:
      return {
        plan: "FREE",
        credits: settings.free_credits,
      };
  }
}