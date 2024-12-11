import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const withAuth = (WrappedComponent: React.FC) => {
  const AuthComponent: React.FC = (props) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      const token = Cookies.get("authToken");

      if (!token) {
        // No token found, redirect to login
        Cookies.remove("authToken");
        Cookies.remove("refreshToken");
        router.push("/login");
      } else {
        // Token exists, allow access
        setIsAuthenticated(true);
      }
    }, [router]);

    if (!isAuthenticated) {
      // Don't render the protected component until authentication is verified
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  AuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return AuthComponent;
};

export default withAuth;
