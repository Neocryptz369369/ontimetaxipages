import { redirect } from "next/navigation";

// This used to be a mock checklist that only toggled local component state and
// never saved anything. The real driver application (with real license and
// insurance uploads, saved to the database) now lives at /driver-login.
export default function DrivePage() {
  redirect("/driver-login");
}
