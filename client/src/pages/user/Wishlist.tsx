import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";

export const Wishlist = () => {
  const { isAuthenticated } = useAuthStore();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    toast.error("Please login to view your wishlist");
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      <p>Wishlist page - Display saved products</p>
    </div>
  );
};
