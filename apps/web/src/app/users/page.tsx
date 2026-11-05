"use client";

import {
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Plus,
  Shield,
  Trash2,
  UserCheck,
  UserCog,
  UserPlus,
  Users as UsersIcon,
  UserX,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Badge, type BadgeTone } from "@/components/Badge";
import { Banner } from "@/components/Banner";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import { useAuth } from "@/lib/authContext";
import { useT } from "@/lib/i18n";
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser,
  type UserInfo,
  type UserRole,
} from "@/lib/api";

const ROLE_TONE: Record<UserRole, BadgeTone> = {
  admin: "running",
  editor: "success",
  viewer: "muted",
};

export default function UsersPage() {
  const { t, tf } = useT();
  const { user: currentUser, isAdmin, loading: authLoading } = useAuth();

  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal thêm tài khoản
  const [createOpen, setCreateOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>("editor");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Modal sửa tài khoản
  const [editUser, setEditUser] = useState<UserInfo | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("editor");
  const [editIsActive, setEditIsActive] = useState(1);
  const [editPassword, setEditPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Xóa tài khoản
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchUsers() {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await listUsers();
      setUsers(res.users);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t("users.error-fetch"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreateSubmitting(true);
    try {
      await createUser({
        username: newUsername.trim(),
        name: newName.trim(),
        password: newPassword,
        role: newRole,
      });
      setCreateOpen(false);
      setNewUsername("");
      setNewName("");
      setNewPassword("");
      setNewRole("editor");
      setSuccessMsg(t("users.created-success"));
      fetchUsers();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : t("users.error-generic"));
    } finally {
      setCreateSubmitting(false);
    }
  }

  function openEdit(u: UserInfo) {
    setEditUser(u);
    setEditName(u.name);
    setEditRole(u.role);
    setEditIsActive(u.isActive);
    setEditPassword("");
    setEditConfirmPassword("");
    setShowEditPassword(false);
    setShowEditConfirmPassword(false);
    setEditError(null);
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setEditError(null);

    if (editPassword || editConfirmPassword) {
      if (editPassword.length < 6) {
        setEditError(t("users.error-password-min-length"));
        return;
      }
      if (editPassword !== editConfirmPassword) {
        setEditError(t("users.error-password-mismatch"));
        return;
      }
    }

    setEditSubmitting(true);
    try {
      await updateUser(editUser.id, {
        name: editName.trim(),
        role: editRole,
        isActive: editIsActive,
        password: editPassword ? editPassword : undefined,
      });
      setEditUser(null);
      setSuccessMsg(t("users.updated-success"));
      fetchUsers();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : t("users.error-generic"));
    } finally {
      setEditSubmitting(false);
    }
  }

  async function handleDelete(u: UserInfo) {
    if (u.id === currentUser?.id) return;
    const ok = window.confirm(tf("users.confirm-delete", { name: u.name }));
    if (!ok) return;

    setDeletingId(u.id);
    try {
      await deleteUser(u.id);
      setSuccessMsg(t("users.deleted-success"));
      fetchUsers();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : t("users.error-generic"));
    } finally {
      setDeletingId(null);
    }
  }

  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-meta text-[var(--text-muted)]">
        {t("users.loading")}
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-6 max-w-4xl mx-auto flex flex-col gap-4">
        <Banner tone="danger" message={t("users.unauthorized-title")}>
          <p className="text-meta text-[var(--text-muted)]">
            {t("users.unauthorized-desc")}
          </p>
        </Banner>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-sm font-semibold flex items-center gap-2">
            <UsersIcon size={18} className="text-[var(--primary)]" aria-hidden="true" />
            <span>{t("users.page-title")}</span>
          </h1>
          <p className="text-meta text-[var(--text-muted)]">
            {t("users.page-subtitle")}
          </p>
        </div>

        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus size={16} strokeWidth={2} aria-hidden="true" />
          <span>{t("users.btn-add")}</span>
        </Button>
      </div>

      {successMsg && (
        <Banner tone="success" message={successMsg} />
      )}
      {errorMsg && (
        <Banner tone="danger" message={errorMsg} />
      )}

      {/* Danh sách người dùng */}
      <Card title={t("users.card-title")}>
        {loading ? (
          <div className="p-6 text-center text-meta text-[var(--text-muted)]">
            {t("users.loading")}
          </div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-meta text-[var(--text-muted)]">
            {t("users.empty")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs text-[var(--text-muted)] uppercase">
                  <th className="py-2.5 px-3">{t("users.col-user")}</th>
                  <th className="py-2.5 px-3">{t("users.col-role")}</th>
                  <th className="py-2.5 px-3">{t("users.col-status")}</th>
                  <th className="py-2.5 px-3">{t("users.col-created")}</th>
                  <th className="py-2.5 px-3 text-right">{t("users.col-actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  const roleLabel = t(`users.role-${u.role}`);
                  return (
                    <tr key={u.id} className="hover:bg-[var(--bg-subtle)] transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[var(--text)]">
                            {u.name} {isSelf && <span className="text-xs text-[var(--primary)] font-normal">({t("users.tag-self")})</span>}
                          </span>
                          <span className="text-meta text-[var(--text-muted)]">@{u.username}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge tone={ROLE_TONE[u.role] ?? "muted"} label={roleLabel} />
                      </td>
                      <td className="py-3 px-3">
                        {u.isActive === 1 ? (
                          <span className="inline-flex items-center gap-1 text-meta text-[var(--success)]">
                            <UserCheck size={14} aria-hidden="true" />
                            <span>{t("users.status-active")}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-meta text-[var(--danger)]">
                            <UserX size={14} aria-hidden="true" />
                            <span>{t("users.status-locked")}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-meta text-[var(--text-muted)]">
                        {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button small variant="secondary" onClick={() => openEdit(u)}>
                            <UserCog size={14} aria-hidden="true" />
                            <span>{t("users.btn-edit")}</span>
                          </Button>
                          <Button
                            small
                            variant="destructive"
                            disabled={isSelf || deletingId === u.id}
                            onClick={() => handleDelete(u)}
                            title={isSelf ? t("users.tooltip-cannot-delete-self") : undefined}
                          >
                            <Trash2 size={14} aria-hidden="true" />
                            <span>{t("users.btn-delete")}</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal tạo tài khoản */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="card w-full max-w-md p-6 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <UserPlus size={16} className="text-[var(--primary)]" aria-hidden="true" />
                <span>{t("users.modal-create-title")}</span>
              </h2>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text)] p-1 rounded-[var(--radius)]"
                aria-label={t("users.btn-close")}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {createError && (
              <Banner tone="danger" message={createError} />
            )}

            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <Field label={t("users.field-username")} htmlFor="new-username" required>
                <input
                  id="new-username"
                  type="text"
                  className="input w-full"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="editor1"
                  required
                  autoFocus
                />
              </Field>

              <Field label={t("users.field-name")} htmlFor="new-name" required>
                <input
                  id="new-name"
                  type="text"
                  className="input w-full"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </Field>

              <Field label={t("users.field-password")} htmlFor="new-password" required>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    className="input w-full pr-9"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                    aria-label={
                      showNewPassword
                        ? t("users.hide-password")
                        : t("users.show-password")
                    }
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>

              <Field label={t("users.field-role")} htmlFor="new-role" required>
                <select
                  id="new-role"
                  className="input w-full cursor-pointer"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                >
                  <option value="editor">{t("users.role-editor")} - {t("users.role-editor-desc")}</option>
                  <option value="admin">{t("users.role-admin")} - {t("users.role-admin-desc")}</option>
                  <option value="viewer">{t("users.role-viewer")} - {t("users.role-viewer-desc")}</option>
                </select>
              </Field>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
                  {t("users.btn-cancel")}
                </Button>
                <Button type="submit" variant="primary" disabled={createSubmitting}>
                  {createSubmitting ? t("users.submitting") : t("users.btn-create-submit")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal sửa tài khoản */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="card w-full max-w-md p-6 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <UserCog size={16} className="text-[var(--primary)]" aria-hidden="true" />
                <span>{tf("users.modal-edit-title", { username: editUser.username })}</span>
              </h2>
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text)] p-1 rounded-[var(--radius)]"
                aria-label={t("users.btn-close")}
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {editError && (
              <Banner tone="danger" message={editError} />
            )}

            <form onSubmit={handleUpdate} className="flex flex-col gap-3">
              <Field label={t("users.field-name")} htmlFor="edit-name" required>
                <input
                  id="edit-name"
                  type="text"
                  className="input w-full"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </Field>

              <Field label={t("users.field-role")} htmlFor="edit-role" required>
                <select
                  id="edit-role"
                  className="input w-full cursor-pointer"
                  value={editRole}
                  disabled={editUser.id === currentUser?.id}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                >
                  <option value="editor">{t("users.role-editor")}</option>
                  <option value="admin">{t("users.role-admin")}</option>
                  <option value="viewer">{t("users.role-viewer")}</option>
                </select>
                {editUser.id === currentUser?.id && (
                  <p className="text-xs text-[var(--text-muted)] pt-1">
                    {t("users.hint-cannot-change-own-role")}
                  </p>
                )}
              </Field>

              <Field label={t("users.field-status")} htmlFor="edit-status" required>
                <select
                  id="edit-status"
                  className="input w-full cursor-pointer"
                  value={editIsActive}
                  disabled={editUser.id === currentUser?.id}
                  onChange={(e) => setEditIsActive(Number(e.target.value))}
                >
                  <option value={1}>{t("users.status-active")}</option>
                  <option value={0}>{t("users.status-locked")}</option>
                </select>
              </Field>

              <Field
                label={t("users.field-new-password")}
                htmlFor="edit-password"
                hint={t("users.hint-leave-blank-password")}
              >
                <div className="relative">
                  <input
                    id="edit-password"
                    type={showEditPassword ? "text" : "password"}
                    className="input w-full pr-9"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder={t("users.placeholder-new-password")}
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                    aria-label={
                      showEditPassword
                        ? t("users.hide-password")
                        : t("users.show-password")
                    }
                  >
                    {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>

              <Field
                label={t("users.field-confirm-password")}
                htmlFor="edit-confirm-password"
              >
                <div className="relative">
                  <input
                    id="edit-confirm-password"
                    type={showEditConfirmPassword ? "text" : "password"}
                    className="input w-full pr-9"
                    value={editConfirmPassword}
                    onChange={(e) => setEditConfirmPassword(e.target.value)}
                    placeholder={t("users.placeholder-confirm-password")}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
                    aria-label={
                      showEditConfirmPassword
                        ? t("users.hide-password")
                        : t("users.show-password")
                    }
                  >
                    {showEditConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border)]">
                <Button type="button" variant="secondary" onClick={() => setEditUser(null)}>
                  {t("users.btn-cancel")}
                </Button>
                <Button type="submit" variant="primary" disabled={editSubmitting}>
                  {editSubmitting ? t("users.submitting") : t("users.btn-save-submit")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
