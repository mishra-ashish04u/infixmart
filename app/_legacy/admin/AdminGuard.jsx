import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import adminAxios from "./utils/adminAxios";

export default function AdminGuard({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    adminAxios
      .get("/api/user/user-details")
      .then((res) => {
        setIsAuthorized(res.data?.user?.role === "admin");
      })
      .catch(() => {
        setIsAuthorized(false);
      });
  }, []);

  if (isAuthorized === null) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: "9999px", border: "4px solid #dbeafe", borderTopColor: "#1565C0", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!isAuthorized) return <Navigate to="/admin/login" replace />;

  return children;
}
