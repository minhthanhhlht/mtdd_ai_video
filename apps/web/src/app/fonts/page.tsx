"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Search,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Field } from "@/components/Field";
import { IconButton } from "@/components/IconButton";
import { PageHeader } from "@/components/PageHeader";
import { Panel } from "@/components/Panel";
import { useFonts, type FontEntry } from "@/lib/fonts";
import { useT } from "@/lib/i18n";

export default function FontsPage() {
  const { t, tf } = useT();
  const { fonts, loading, error, addFont, removeFont, refresh } = useFonts();

  // State upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // State Live Type Tester
  const [testText, setTestText] = useState<string>(
    "Khám phá video AI đỉnh cao cùng Noti.vn — Trăm năm trong cõi người ta, chữ tài chữ mệnh khéo là ghét nhau."
  );
  const [testSize, setTestSize] = useState<number>(24);

  // State tìm kiếm, phân trang & xóa
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);
  const [deletingFont, setDeletingFont] = useState<FontEntry | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Lọc danh sách font theo từ khóa
  const filteredFonts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return fonts;
    return fonts.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q) ||
        f.family.toLowerCase().includes(q)
    );
  }, [fonts, search]);

  // Tính toán phân trang
  const totalPages = Math.max(1, Math.ceil(filteredFonts.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedFonts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFonts.slice(start, start + pageSize);
  }, [filteredFonts, currentPage, pageSize]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    setUploadSuccess(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setUploadError("File phông chữ vượt quá kích thước cho phép (tối đa 15MB).");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    if (!customName) {
      // Gợi ý tên đẹp từ tên file
      const base = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
      const pretty = base.charAt(0).toUpperCase() + base.slice(1);
      setCustomName(pretty);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const created = await addFont(selectedFile, customName.trim() || undefined);
      setUploadSuccess(`${t("fonts.upload.success")}: ${created.name}`);
      setSelectedFile(null);
      setCustomName("");
      setPage(1); // Chuyển về trang đầu để người dùng thấy font mới ngay
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFont) return;
    setDeleteLoading(true);
    try {
      await removeFont(deletingFont.id);
      setDeletingFont(null);
      // Nếu xóa phần tử cuối cùng của trang thì lùi trang
      if (paginatedFonts.length === 1 && currentPage > 1) {
        setPage((p) => Math.max(1, p - 1));
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("fonts.title")}
        subtitle={t("fonts.subtitle")}
      />

      {error && <ErrorBanner message={t("fonts.load-error")} />}
      {uploadError && (
        <div className="p-3 rounded-[var(--radius)] bg-[var(--error)]/10 border border-[var(--error)]/20 text-sm text-[var(--error)] flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
      {uploadSuccess && (
        <div className="p-3 rounded-[var(--radius)] bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* KHỐI 1: Tải lên font mới */}
      <Card title={t("fonts.upload.title")}>
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label={t("fonts.upload.file")}
              htmlFor="font-file-input"
              hint={t("fonts.upload.file-hint")}
              required
            >
              <input
                ref={fileInputRef}
                id="font-file-input"
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={handleFileChange}
                disabled={uploading}
                className="input file:mr-3 file:py-1 file:px-2 file:rounded-[var(--radius)] file:border-0 file:text-xs file:font-semibold file:bg-[var(--primary)] file:text-white cursor-pointer"
              />
            </Field>

            <Field
              label={t("fonts.upload.name")}
              htmlFor="font-name-input"
              hint={t("fonts.upload.name-hint")}
            >
              <input
                id="font-name-input"
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={t("fonts.upload.name-placeholder")}
                disabled={uploading}
                className="input"
              />
            </Field>
          </div>

          <div className="flex justify-end items-center gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={!selectedFile || uploading}
              className="gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {t("fonts.upload.uploading")}
                </>
              ) : (
                <>
                  <Upload size={14} />
                  {t("fonts.upload.button")}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* KHỐI 2: Live Type Tester */}
      <Card title={t("fonts.test.title")}>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <Field label={t("fonts.test.placeholder")} htmlFor="test-text-input">
                <input
                  id="test-text-input"
                  type="text"
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="input"
                />
              </Field>
            </div>
            <div>
              <Field label={t("fonts.test.size")} htmlFor="test-size-select">
                <select
                  id="test-size-select"
                  value={testSize}
                  onChange={(e) => setTestSize(Number(e.target.value))}
                  className="input"
                >
                  <option value={16}>16px</option>
                  <option value={20}>20px</option>
                  <option value={24}>24px (Mặc định)</option>
                  <option value={32}>32px</option>
                  <option value={40}>40px (Tiêu đề)</option>
                </select>
              </Field>
            </div>
          </div>
        </div>
      </Card>

      {/* KHỐI 3: Danh sách phông chữ có phân trang */}
      <Card
        title={tf("fonts.list.title", { n: filteredFonts.length })}
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder={t("fonts.search.placeholder")}
                aria-label={t("fonts.search.aria")}
                className="input pl-8 py-1 text-sm h-8 w-48 sm:w-64"
              />
            </div>
          </div>
        }
      >
        {loading && fonts.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-meta text-[var(--text-muted)]">
            <Loader2 size={16} className="animate-spin mr-2" />
            <span>{t("fonts.upload.uploading")}</span>
          </div>
        ) : filteredFonts.length === 0 ? (
          <EmptyState
            icon={Type}
            title={t("fonts.empty")}
            description=""
          />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {paginatedFonts.map((f) => (
                <Panel key={f.id} className="p-4 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-[var(--text)]">
                        {f.name}
                      </span>
                      <Badge
                        tone={f.isBuiltin ? "muted" : "success"}
                        label={f.isBuiltin ? t("fonts.builtin") : t("fonts.custom")}
                        dot={false}
                      />
                      <Badge
                        tone="muted"
                        label={`.${f.format === "truetype" ? "ttf" : f.format === "opentype" ? "otf" : f.format}`}
                        dot={false}
                      />
                      <span className="text-xs text-[var(--text-muted)]">
                        {tf("fonts.weight", { weight: f.weight })}
                      </span>
                    </div>

                    {!f.isBuiltin && (
                      <IconButton
                        label={t("fonts.delete.title")}
                        tone="danger"
                        onClick={() => setDeletingFont(f)}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    )}
                  </div>

                  {/* Live Preview Text Box */}
                  <div
                    className="py-2 px-3 rounded-[var(--radius)] bg-[var(--surface-raised)] border border-[var(--border)] min-w-0 overflow-x-auto"
                    style={{
                      fontFamily: `'${f.family}', 'CaptionInter', sans-serif`,
                      fontSize: `${testSize}px`,
                      lineHeight: 1.4,
                    }}
                  >
                    {testText || "Tiếng Việt đủ dấu: Ă Â Đ Ê Ô Ơ Ư"}
                  </div>
                </Panel>
              ))}
            </div>

            {/* Thanh điều khiển phân trang */}
            {filteredFonts.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
                {/* Thông tin số trang & tổng số font */}
                <span className="text-meta text-[var(--text-muted)]">
                  {tf("fonts.page-info", {
                    page: currentPage,
                    totalPages,
                    total: filteredFonts.length,
                  })}
                </span>

                {/* Các nút phân trang */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Bộ chọn số lượng font / trang */}
                  <select
                    className="input h-8 py-1 px-2 text-xs"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    aria-label={t("fonts.per-page")}
                  >
                    <option value={6}>{tf("fonts.per-page", { n: 6 })}</option>
                    <option value={12}>{tf("fonts.per-page", { n: 12 })}</option>
                    <option value={24}>{tf("fonts.per-page", { n: 24 })}</option>
                  </select>

                  {/* Nút Trước */}
                  <Button
                    variant="secondary"
                    small
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="gap-1 h-8"
                  >
                    <ChevronLeft size={14} />
                    <span>{t("fonts.prev-page")}</span>
                  </Button>

                  {/* Các nút số trang */}
                  {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === totalPages ||
                            Math.abs(p - currentPage) <= 1
                        )
                        .reduce<(number | string)[]>((acc, p, idx, arr) => {
                          if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) {
                            acc.push("...");
                          }
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, idx) =>
                          typeof p === "string" ? (
                            <span
                              key={`ellipsis-${idx}`}
                              className="px-1 text-xs text-[var(--text-muted)]"
                            >
                              ...
                            </span>
                          ) : (
                            <Button
                              key={p}
                              variant={p === currentPage ? "primary" : "secondary"}
                              small
                              onClick={() => setPage(p)}
                              className="w-8 h-8 p-0 justify-center text-xs"
                            >
                              {p}
                            </Button>
                          )
                        )}
                    </div>
                  )}

                  {/* Nút Sau */}
                  <Button
                    variant="secondary"
                    small
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="gap-1 h-8"
                  >
                    <span>{t("fonts.next-page")}</span>
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Modal xác nhận xóa font */}
      {deletingFont && (
        <ConfirmDeleteModal
          open={Boolean(deletingFont)}
          title={t("fonts.delete.title")}
          description={tf("fonts.delete.confirm", { name: deletingFont.name })}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeletingFont(null)}
          busy={deleteLoading}
        />
      )}
    </div>
  );
}
