import { useAuth } from "../context/AuthContext.js";
import { AdminHome } from "./home/AdminHome.js";
import { AuditorHome } from "./home/AuditorHome.js";
import { DataEntryHome } from "./home/DataEntryHome.js";

export function Dashboard() {
  const { user } = useAuth();

  if (user?.role === "auditor") return <AuditorHome />;
  if (user?.role === "admin") return <AdminHome />;
  return <DataEntryHome />;
}
