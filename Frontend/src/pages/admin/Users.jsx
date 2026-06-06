import { useMemo, useState } from "react";
import { Download, Users as UsersIcon } from "lucide-react";
import { api } from "@/lib/api";
import { inputCls, primaryBtn, secondaryBtn } from "@/lib/adminStyles";
import { formatDate } from "@/lib/format";
import PageHeader from "@/components/Admin/PageHeader";
import AdminTable from "@/components/Admin/AdminTable";
import StatusBadge from "@/components/Admin/StatusBadge";
import ConfirmDialog from "@/components/Admin/ConfirmDialog";
import { useApiList } from "@/hooks/useApiList";
import { PageTransition } from "@/components/ui/Motion";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2";

export default function AdminUsers() {
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [search, setSearch] = useState("");
  const [confirmTarget, setConfirmTarget] = useState(null);

  const params = useMemo(() => {
    const p = {};
    if (roleFilter) p.role = roleFilter;
    if (activeFilter) p.isActive = activeFilter;
    return p;
  }, [roleFilter, activeFilter]);

  const list = useApiList("/users/admin", { params, pageSize: 20 });

  const handleExport = () => {
    const baseURL =
      api.defaults.baseURL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:3100/api/v1";
    const qs = new URLSearchParams();
    if (roleFilter) qs.set("role", roleFilter);
    if (activeFilter) qs.set("isActive", activeFilter);
    const url = `${baseURL}/admin/export/users${qs.toString() ? `?${qs}` : ""}`;
    window.open(url, "_blank");
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return list.items;
    return list.items.filter((u) => {
      const fullname = `${u.firstname || ""} ${u.lastname || ""}`.toLowerCase();
      return (
        fullname.includes(term) ||
        (u.email || "").toLowerCase().includes(term) ||
        (u.number || "").toLowerCase().includes(term)
      );
    });
  }, [list.items, search]);

  const handleToggleActive = (u) =>
    list.patch(
      u._id,
      { isActive: !u.isActive },
      u.isActive ? "User deactivated" : "User activated"
    );

  const performToggleRole = async (u) => {
    const nextRole = u.role === "admin" ? "user" : "admin";
    await list.patch(
      u._id,
      { role: nextRole },
      nextRole === "admin" ? "Promoted to admin" : "Demoted to user"
    );
    setConfirmTarget(null);
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (u) => (
        <span className="text-slate-800 font-medium">
          {u.firstname} {u.lastname || ""}
        </span>
      ),
    },
    { key: "email", header: "Email", render: (u) => <span className="text-slate-800 text-sm">{u.email}</span> },
    { key: "phone", header: "Phone", render: (u) => <span className="text-slate-800 text-sm">{u.number || "—"}</span> },
    { key: "city", header: "City", render: (u) => <span className="text-slate-800 text-sm">{u.city || "—"}</span> },
    {
      key: "role",
      header: "Role",
      render: (u) => (
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${
            u.role === "admin"
              ? "bg-red-100 text-red-600 border-red-200"
              : "bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          {u.role}
        </span>
      ),
    },
    { key: "joined", header: "Joined", render: (u) => <span className="text-sm text-slate-400">{formatDate(u.createdAt)}</span> },
    {
      key: "active",
      header: "Active",
      render: (u) => (
        <button
          type="button"
          onClick={() => handleToggleActive(u)}
          disabled={list.busyId === u._id}
          aria-pressed={Boolean(u.isActive)}
          className={`appearance-none disabled:opacity-60 rounded-full ${focusRing}`}
        >
          <StatusBadge variant={u.isActive ? "active" : "inactive"} />
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (u) => {
        const isAdmin = u.role === "admin";
        // Demote (admin -> user) keeps a destructive look. Promotion uses the
        // standard primary style instead of red.
        return (
          <button
            type="button"
            onClick={() => setConfirmTarget(u)}
            disabled={list.busyId === u._id}
            className={
              isAdmin
                ? `text-rose-600 hover:text-rose-700 text-sm font-medium disabled:opacity-60 rounded ${focusRing}`
                : `${primaryBtn} text-xs px-3 py-1.5 ${focusRing}`
            }
          >
            {isAdmin ? "Demote" : "Make Admin"}
          </button>
        );
      },
    },
  ];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Users"
          action={
            <>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={`${inputCls} ${focusRing}`}
              >
                <option value="">All roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className={`${inputCls} ${focusRing}`}
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, phone..."
                className={`${inputCls} w-72 ${focusRing}`}
              />
              <button
                type="button"
                onClick={handleExport}
                className={`${secondaryBtn} ${focusRing}`}
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </>
          }
        />

        <AdminTable
          rows={filtered}
          columns={columns}
          rowKey={(u) => u._id}
          loading={list.loading}
          emptyIcon={UsersIcon}
          emptyTitle={
            list.items.length === 0 ? "No users yet." : "No users match your search."
          }
          pagination={{
            page: list.page,
            pageCount: list.pageCount,
            total: list.total,
            itemLabel: "users",
            onChange: list.setPage,
            disabled: list.loading,
          }}
        />

        <ConfirmDialog
          open={Boolean(confirmTarget)}
          onClose={() => setConfirmTarget(null)}
          onConfirm={() => confirmTarget && performToggleRole(confirmTarget)}
          title={
            confirmTarget?.role === "admin" ? "Demote to user?" : "Promote to admin?"
          }
          message={
            confirmTarget
              ? confirmTarget.role === "admin"
                ? `Demote ${confirmTarget.email} to a regular user?`
                : `Promote ${confirmTarget.email} to admin? They will gain full admin access.`
              : ""
          }
          confirmLabel={confirmTarget?.role === "admin" ? "Demote" : "Promote"}
          danger={confirmTarget?.role === "admin"}
        />
      </div>
    </PageTransition>
  );
}
