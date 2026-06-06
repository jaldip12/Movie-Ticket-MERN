import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PageTransition } from "@/components/ui/Motion";

function FullScreenSpinner() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div
        role="status"
        aria-label="Checking sign-in"
        className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-red-500"
      >
        <span className="sr-only">Checking sign-in</span>
      </div>
    </div>
  );
}

export default function RequireAuth({ role }) {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <FullScreenSpinner />;

  if (status !== "authenticated") {
    return (
      <Navigate
        to="/auth/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return (
    <PageTransition>
      <Outlet />
    </PageTransition>
  );
}
