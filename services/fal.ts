import { fal } from "@fal-ai/client";

console.log("━━━━━━━━━━━━━━━━");
console.log("FAL KEY PREFIX:");
console.log(process.env.FAL_KEY?.substring(0, 8));
console.log("━━━━━━━━━━━━━━━━");

fal.config({
  credentials: process.env.FAL_KEY!,
});

export default fal;