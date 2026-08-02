import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Admin layout route — parent for /admin (dashboard) and /admin/login.
 * Auth is handled individually by each child route.
 * This layout simply renders its child via <Outlet />.
 */
export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return <Outlet />;
}
