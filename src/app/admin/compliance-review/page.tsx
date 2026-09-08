import { redirect } from "next/navigation";

// This used to read fake decisions out of the browser's own local storage,
// which meant it never showed real data and could not be seen from another
// device. Real license and insurance documents, plus background check and
// driving record sign-off, are now reviewed at /admin/drivers.
export default function ComplianceReviewPage() {
  redirect("/admin/drivers");
}
