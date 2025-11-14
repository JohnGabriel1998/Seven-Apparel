import { useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const wasAuthenticated = useRef(isAuthenticated);
  const previousPath = useRef(location.pathname);
  const hasShownToast = useRef(false);

  useEffect(() => {
    const isOnAdminRoute = location.pathname.startsWith("/admin");
    const wasOnAdminRoute = previousPath.current.startsWith("/admin");
    const isNavigatingAway = wasOnAdminRoute && !isOnAdminRoute;
    const isLoggingOut = wasAuthenticated.current === true && isAuthenticated === false;
    const isIntentionalLogout = localStorage.getItem('isLoggingOut') === 'true';
    
    // Don't show toast if:
    // 1. User is logging out intentionally (has logout flag set)
    // 2. User is logging out (was authenticated, now not)
    // 3. User is navigating away from admin routes
    // 4. Toast was already shown for this access attempt
    
    if (!isIntentionalLogout && !isLoggingOut && !isNavigatingAway && isOnAdminRoute) {
      if (!isAuthenticated && !hasShownToast.current) {
        // Only show if user was never authenticated (not a logout scenario)
        if (wasAuthenticated.current === false) {
          toast.error("Please login to access admin panel");
          hasShownToast.current = true;
        }
      } else if (isAuthenticated && user?.role !== "admin" && !hasShownToast.current) {
        toast.error("Access denied. Admin privileges required.");
        hasShownToast.current = true;
      }
    }
    
    // Reset toast flag when user logs in (becomes authenticated)
    if (isAuthenticated && !wasAuthenticated.current) {
      hasShownToast.current = false;
    }
    
    // Reset toast flag when navigating away from admin routes
    if (isNavigatingAway) {
      hasShownToast.current = false;
    }
    
    wasAuthenticated.current = isAuthenticated;
    previousPath.current = location.pathname;
  }, [isAuthenticated, user, location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
