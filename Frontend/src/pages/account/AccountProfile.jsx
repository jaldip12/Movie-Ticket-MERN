import { Navigate } from "react-router-dom";

/**
 * The old 3-tab AccountProfile has been split into dedicated routes under
 * /account/*. We keep this file as a stable redirect target so any cached
 * client routes (or external links) still land somewhere sensible.
 */
export default function AccountProfile() {
  return <Navigate to="/account/profile" replace />;
}
