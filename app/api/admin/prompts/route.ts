import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import {
deleteAdminPrompt,
} from "@/services/adminPromptService";

export async function DELETE(request: Request) {
try {
await requireAdmin();

const body = await request.json();
const { id } = body;

if (!id || typeof id !== "string") {
  return NextResponse.json(
    {
      success: false,
      error: "Prompt ID is required.",
    },
    { status: 400 }
  );
}

await deleteAdminPrompt(id);

return NextResponse.json({
  success: true,
});

} catch (error) {
console.error(
"Admin Delete Prompt API Error:",
error
);

if (
  error instanceof Error &&
  error.message === "UNAUTHORIZED"
) {
  return NextResponse.json(
    {
      success: false,
      error: "Unauthorized.",
    },
    { status: 401 }
  );
}

if (
  error instanceof Error &&
  error.message === "FORBIDDEN"
) {
  return NextResponse.json(
    {
      success: false,
      error: "Admin access required.",
    },
    { status: 403 }
  );
}

return NextResponse.json(
  {
    success: false,
    error: "Failed to delete prompt.",
  },
  { status: 500 }
);

}
}
