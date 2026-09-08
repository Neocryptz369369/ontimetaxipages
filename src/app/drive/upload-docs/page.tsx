import { redirect } from "next/navigation";

// This used to save fake "approved/denied" decisions to the browser's local
// storage only, which the owner could never actually see. Real document
// uploads (license and insurance) are now part of the real application at
// /driver-login, and the owner reviews them at /admin/drivers.
export default function UploadDocsPage() {
  redirect("/driver-login");
}
