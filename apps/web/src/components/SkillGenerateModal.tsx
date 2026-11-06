"use client";

/**
 * Modal "Tạo skill bằng AI" - 2 bước:
 * 1. Form brief:
 *    - Tab "Từ mô tả văn bản": Form brief (mục đích, nền tảng, khung, fps, phụ đề…) → POST /api/skills/generate
 *    - Tab "Từ link hoặc video mẫu": Nhập URL (TikTok/Shorts/Reels) hoặc tải file MP4 → POST /api/skills/from-video
 * 2. Duyệt draft: sửa tên + nội dung SKILL.md rồi lưu qua POST /api/skills (đối với prompt).
 *    (Đối với video: server đã lưu trọn bộ skill package, onSaved được gọi trực tiếp).
 */

import { ArrowLeft, RefreshCw, Save, Sparkles, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import {
  ApiError,
  createSkill,
  generateSkill,
  generateSkillFromVideo,
  SkillGenerateError,
  type SkillGenerateInput,
  type SkillMeta,
} from "@/lib/api";
import { Button } from "@/components/Button";
import { CheckboxField, Field } from "@/components/Field";
import { ErrorBanner } from "@/components/ErrorBanner";
import { IconButton } from "@/components/IconButton";
import { Modal } from "@/components/Modal";
import { Panel } from "@/components/Panel";
import { Segmented } from "@/components/Segmented";
import { formatBytes, formatTokens, KEBAB_RE } from "@/lib/format";
import { useT } from "@/lib/i18n";

const PLATFORM_OPTIONS = [
  "TikTok",
  "YouTube",
  "Facebook",
  "Instagram",
  "Khác",
] as const;

const ASPECT_OPTIONS = ["9:16", "16:9", "1:1", "4:5"] as const;
type AspectOption = (typeof ASPECT_OPTIONS)[number];

const ASPECT_SEGMENTS = ASPECT_OPTIONS.map((a) => ({ value: a, label: a }));
const FPS_SEGMENTS = [
  { value: "30", label: "30" },
  { value: "60", label: "60" },
] as const;

const CAPTION_OPTIONS: {
  value: "karaoke" | "sentence" | "none";
  label: string;
}[] = [
  { value: "karaoke", label: "skillGen.caption.karaoke" },
  { value: "sentence", label: "skillGen.caption.sentence" },
  { value: "none", label: "skillGen.caption.none" },
];

const NO_BASE = "";
const SUGGESTED_BASE = "noti-tiktok-vn";

interface FormState {
  goal: string;
  platform: (typeof PLATFORM_OPTIONS)[number];
  aspect: AspectOption;
  fps: 30 | 60;
  duration: string;
  style: string;
  captions: "karaoke" | "sentence" | "none";
  highlights: boolean;
  sfx: boolean;
  baseSkill: string;
  name: string;
  notes: string;
}

function initialForm(skills: SkillMeta[]): FormState {
  return {
    goal: "",
    platform: "TikTok",
    aspect: "9:16",
    fps: 30,
    duration: "",
    style: "",
    captions: "karaoke",
    highlights: true,
    sfx: true,
    baseSkill: skills.some((s) => s.name === SUGGESTED_BASE)
      ? SUGGESTED_BASE
      : NO_BASE,
    name: "",
    notes: "",
  };
}

function toInput(f: FormState): SkillGenerateInput {
  return {
    goal: f.goal.trim(),
    ...(f.name.trim() ? { name: f.name.trim() } : {}),
    ...(f.platform !== "Khác" ? { platform: f.platform } : {}),
    aspect: f.aspect,
    fps: f.fps,
    ...(f.duration.trim() ? { duration: f.duration.trim() } : {}),
    ...(f.style.trim() ? { style: f.style.trim() } : {}),
    captions: f.captions,
    highlights: f.highlights,
    sfx: f.sfx,
    ...(f.baseSkill ? { baseSkill: f.baseSkill } : {}),
    ...(f.notes.trim() ? { notes: f.notes.trim() } : {}),
  };
}

export function SkillGenerateModal({
  open,
  skills,
  onClose,
  onSaved,
}: {
  open: boolean;
  /** Danh sách skill hiện có - nguồn select "Skill mẫu tham khảo". */
  skills: SkillMeta[];
  onClose: () => void;
  /** Lưu thành công - parent đóng modal, reload danh sách, điều hướng. */
  onSaved: (name: string) => void;
}) {
  const { t, tf } = useT();
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<"prompt" | "video">("prompt");
  const [form, setForm] = useState<FormState>(() => initialForm(skills));
  const [formInitialized, setFormInitialized] = useState(false);

  // Tab 1 (Prompt mode) states
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Tab 2 (Video mode) states
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSkillName, setVideoSkillName] = useState("");
  const [videoNotes, setVideoNotes] = useState("");
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoGenError, setVideoGenError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Kết quả bước 2 (cho prompt mode)
  const [draftName, setDraftName] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftTokens, setDraftTokens] = useState<number | null>(null);
  /** true = draft là raw từ lỗi 422 - AI trả sai định dạng, user sửa tay. */
  const [fromRaw, setFromRaw] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [nameConflict, setNameConflict] = useState(false);

  // Gợi ý baseSkill mặc định khi danh sách skill về sau lúc mount modal
  if (!formInitialized && skills.length > 0) {
    setFormInitialized(true);
    if (!form.baseSkill && skills.some((s) => s.name === SUGGESTED_BASE)) {
      setForm((f) => ({ ...f, baseSkill: SUGGESTED_BASE }));
    }
  }

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));

  const goalValid = form.goal.trim().length > 0;
  const nameHintInvalid =
    form.name.trim() !== "" && !KEBAB_RE.test(form.name.trim());
  const draftNameValid = KEBAB_RE.test(draftName);

  const hasVideoSource = videoUrl.trim().length > 0 || videoFile !== null;
  const videoSkillNameValid =
    videoSkillName.trim() === "" || KEBAB_RE.test(videoSkillName.trim());

  async function onGenerate() {
    if (!goalValid || nameHintInvalid || generating) return;
    setGenerating(true);
    setGenError(null);
    try {
      const res = await generateSkill(toInput(form));
      setDraftName(res.name);
      setDraftContent(res.content);
      setDraftTokens(res.tokens.input + res.tokens.output);
      setFromRaw(false);
      setNameConflict(false);
      setSaveError(null);
      setStep(2);
    } catch (e) {
      if (e instanceof SkillGenerateError && e.status === 422 && e.raw) {
        setDraftName(form.name.trim());
        setDraftContent(e.raw);
        setDraftTokens(null);
        setFromRaw(true);
        setNameConflict(false);
        setSaveError(null);
        setStep(2);
      } else {
        setGenError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setGenerating(false);
    }
  }

  async function onGenerateFromVideo() {
    if (!hasVideoSource || !videoSkillNameValid || generatingVideo) return;
    setGeneratingVideo(true);
    setVideoGenError(null);
    try {
      const res = await generateSkillFromVideo({
        url: videoUrl.trim() || undefined,
        file: videoFile || undefined,
        name: videoSkillName.trim() || undefined,
        notes: videoNotes.trim() || undefined,
      });
      onSaved(res.name);
    } catch (e) {
      setVideoGenError(e instanceof Error ? e.message : String(e));
    } finally {
      setGeneratingVideo(false);
    }
  }

  async function onSave() {
    if (!draftNameValid || !draftContent.trim() || saving) return;
    setSaving(true);
    setSaveError(null);
    setNameConflict(false);
    try {
      await createSkill({ name: draftName, content: draftContent });
      onSaved(draftName);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        setNameConflict(true);
      } else {
        setSaveError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setSaving(false);
    }
  }

  function close() {
    if (generating || saving || generatingVideo) return;
    onClose();
  }

  const busy = generating || saving || generatingVideo;

  return (
    <Modal
      title={step === 1 ? t("skills.create-ai") : t("skillGen.review-title")}
      open={open}
      onClose={close}
      wide={step === 2}
      footer={
        step === 1 ? (
          mode === "prompt" ? (
            <>
              <Button variant="secondary" onClick={close} disabled={generating}>
                {t("common.cancel")}
              </Button>
              <Button
                onClick={onGenerate}
                disabled={!goalValid || nameHintInvalid || generating}
              >
                <Sparkles size={16} strokeWidth={2} />
                {generating ? t("common.creating") : t("skills.create-ai")}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={close}
                disabled={generatingVideo}
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={onGenerateFromVideo}
                disabled={
                  !hasVideoSource || !videoSkillNameValid || generatingVideo
                }
              >
                <Sparkles size={16} strokeWidth={2} />
                {generatingVideo
                  ? t("common.creating")
                  : t("skillGen.video-analyze-btn")}
              </Button>
            </>
          )
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={() => setStep(1)}
              disabled={busy}
            >
              <ArrowLeft size={14} strokeWidth={2} />
              {t("skillGen.edit-answers")}
            </Button>
            <Button variant="secondary" onClick={onGenerate} disabled={busy}>
              <RefreshCw size={14} strokeWidth={2} />
              {generating ? t("skillGen.regenerating") : t("skillGen.regenerate")}
            </Button>
            <Button
              onClick={onSave}
              disabled={!draftNameValid || !draftContent.trim() || busy}
            >
              <Save size={14} strokeWidth={2} />
              {saving ? t("common.saving") : t("skillGen.save")}
            </Button>
          </>
        )
      }
    >
      {step === 1 ? (
        <div className="flex flex-col gap-3">
          <Segmented
            label={t("skills.create-ai")}
            options={[
              { value: "prompt", label: t("skillGen.tab-prompt") },
              { value: "video", label: t("skillGen.tab-video") },
            ]}
            value={mode}
            disabled={busy}
            onChange={(m) => setMode(m as "prompt" | "video")}
          />

          {mode === "prompt" ? (
            <>
              {genError && (
                <ErrorBanner
                  message={t("skillGen.gen-error")}
                  detail={genError}
                />
              )}

              <Field label={t("skillGen.goal-label")} htmlFor="sg-goal">
                <textarea
                  id="sg-goal"
                  className="input min-h-[64px]"
                  rows={3}
                  disabled={generating}
                  value={form.goal}
                  onChange={(e) => patch({ goal: e.target.value })}
                  placeholder={t("skillGen.goal-placeholder")}
                />
              </Field>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label={t("skillGen.platform")} htmlFor="sg-platform">
                  <select
                    id="sg-platform"
                    className="input"
                    disabled={generating}
                    value={form.platform}
                    onChange={(e) =>
                      patch({
                        platform: e.target.value as FormState["platform"],
                      })
                    }
                  >
                    {PLATFORM_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p === "Khác" ? t("projects.other") : p}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t("skillGen.duration")} htmlFor="sg-duration">
                  <input
                    id="sg-duration"
                    className="input"
                    disabled={generating}
                    value={form.duration}
                    onChange={(e) => patch({ duration: e.target.value })}
                    placeholder="30–60s"
                  />
                </Field>
                <Field label={t("skillGen.aspect")}>
                  <Segmented
                    label={t("skillGen.aspect")}
                    options={ASPECT_SEGMENTS}
                    value={form.aspect}
                    disabled={generating}
                    onChange={(aspect) => patch({ aspect })}
                  />
                </Field>
                <Field label="FPS">
                  <Segmented
                    label="FPS"
                    options={FPS_SEGMENTS}
                    value={String(form.fps)}
                    disabled={generating}
                    onChange={(fps) => patch({ fps: Number(fps) as 30 | 60 })}
                  />
                </Field>
                <Field label={t("skillGen.style")} htmlFor="sg-style">
                  <input
                    id="sg-style"
                    className="input"
                    disabled={generating}
                    value={form.style}
                    onChange={(e) => patch({ style: e.target.value })}
                    placeholder={t("skillGen.style-placeholder")}
                  />
                </Field>
                <Field label={t("brief.subtitles")} htmlFor="sg-captions">
                  <select
                    id="sg-captions"
                    className="input"
                    disabled={generating}
                    value={form.captions}
                    onChange={(e) =>
                      patch({
                        captions: e.target.value as FormState["captions"],
                      })
                    }
                  >
                    {CAPTION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {t(o.label)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t("skillGen.base")} htmlFor="sg-base">
                  <select
                    id="sg-base"
                    className="input"
                    disabled={generating}
                    value={form.baseSkill}
                    onChange={(e) => patch({ baseSkill: e.target.value })}
                  >
                    <option value={NO_BASE}>{t("skillGen.no-base")}</option>
                    {skills.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field
                  label={t("skillGen.name-label")}
                  htmlFor="sg-name"
                  hint={t("skillGen.name-hint")}
                  error={nameHintInvalid ? t("skills.kebab-error") : null}
                >
                  <input
                    id="sg-name"
                    className="input"
                    disabled={generating}
                    value={form.name}
                    onChange={(e) => patch({ name: e.target.value })}
                    placeholder="vd: tiktok-review-congnghe"
                  />
                </Field>
                <div className="flex flex-col justify-end gap-2">
                  <CheckboxField
                    id="sg-highlights"
                    label="Keyword highlight"
                    checked={form.highlights}
                    disabled={generating}
                    onChange={(highlights) => patch({ highlights })}
                  />
                  <CheckboxField
                    id="sg-sfx"
                    label={t("skillGen.sfx-sync")}
                    checked={form.sfx}
                    disabled={generating}
                    onChange={(sfx) => patch({ sfx })}
                  />
                </div>
              </div>

              <Field label={t("skillGen.notes")} htmlFor="sg-notes">
                <textarea
                  id="sg-notes"
                  className="input min-h-[48px]"
                  rows={2}
                  disabled={generating}
                  value={form.notes}
                  onChange={(e) => patch({ notes: e.target.value })}
                  placeholder={t("skillGen.notes-placeholder")}
                />
              </Field>

              {generating && (
                <Panel>
                  <div
                    className="progress-indeterminate"
                    aria-label={t("skillGen.generating-aria")}
                  />
                  <p className="text-sm text-[var(--text-muted)]">
                    {t("skillGen.generating")}
                  </p>
                </Panel>
              )}
            </>
          ) : (
            <>
              {videoGenError && (
                <ErrorBanner
                  message={t("skillGen.gen-error")}
                  detail={videoGenError}
                />
              )}

              <Field
                label={t("skillGen.video-url-label")}
                htmlFor="sg-video-url"
              >
                <input
                  id="sg-video-url"
                  className="input"
                  disabled={generatingVideo}
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    if (e.target.value.trim() && videoFile) {
                      setVideoFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }
                  }}
                  placeholder={t("skillGen.video-url-placeholder")}
                />
              </Field>

              <div className="relative flex items-center py-1">
                <div className="grow border-t border-[var(--border)]" />
                <span className="shrink mx-3 text-meta text-[var(--text-muted)]">
                  {t("common.or")}
                </span>
                <div className="grow border-t border-[var(--border)]" />
              </div>

              <Field
                label={t("skillGen.video-file-label")}
                hint={t("skillGen.video-file-hint")}
              >
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    id="sg-video-file"
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    disabled={generatingVideo}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      if (f) {
                        setVideoFile(f);
                        setVideoUrl("");
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={generatingVideo}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={14} strokeWidth={2} />
                    {videoFile ? t("common.edit") : t("assets.choose-files")}
                  </Button>
                  {videoFile ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate text-meta text-[var(--text)]">
                        {videoFile.name} ({formatBytes(videoFile.size)})
                      </span>
                      <IconButton
                        label={t("common.clear")}
                        size="sm"
                        disabled={generatingVideo}
                        onClick={() => {
                          setVideoFile(null);
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                      >
                        <X size={14} strokeWidth={2} />
                      </IconButton>
                    </div>
                  ) : null}
                </div>
              </Field>

              <Field
                label={t("skillGen.name-label")}
                htmlFor="sg-video-name"
                hint={t("skillGen.name-hint")}
                error={!videoSkillNameValid ? t("skills.kebab-error") : null}
              >
                <input
                  id="sg-video-name"
                  className="input"
                  disabled={generatingVideo}
                  value={videoSkillName}
                  onChange={(e) => setVideoSkillName(e.target.value)}
                  placeholder="vd: agency-kinetic-tiktok"
                />
              </Field>

              <Field label={t("skillGen.notes")} htmlFor="sg-video-notes">
                <textarea
                  id="sg-video-notes"
                  className="input min-h-[48px]"
                  rows={2}
                  disabled={generatingVideo}
                  value={videoNotes}
                  onChange={(e) => setVideoNotes(e.target.value)}
                  placeholder={t("skillGen.notes-placeholder")}
                />
              </Field>

              {generatingVideo && (
                <Panel>
                  <div
                    className="progress-indeterminate"
                    aria-label={t("skillGen.generating-aria")}
                  />
                  <p className="text-sm text-[var(--text-muted)]">
                    {t("skillGen.video-analyzing")}
                  </p>
                </Panel>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          {fromRaw && <ErrorBanner message={t("skillGen.bad-format")} />}
          {saveError && (
            <ErrorBanner message={t("skillGen.save-error")} detail={saveError} />
          )}
          {genError && (
            <ErrorBanner message={t("skillGen.regen-error")} detail={genError} />
          )}

          <Field
            label={t("skillGen.draft-name")}
            htmlFor="sg-draft-name"
            error={
              nameConflict
                ? t("skillGen.name-conflict")
                : draftName && !draftNameValid
                  ? t("skills.kebab-error")
                  : null
            }
          >
            <input
              id="sg-draft-name"
              className="input"
              disabled={busy}
              value={draftName}
              onChange={(e) => {
                setDraftName(e.target.value);
                setNameConflict(false);
              }}
              placeholder="ten-skill-kebab-case"
            />
          </Field>

          <Field label={t("skillGen.content-label")} htmlFor="sg-draft-content">
            <textarea
              id="sg-draft-content"
              className="input max-h-[max(420px,calc(90vh-320px))] min-h-[420px] font-mono text-meta leading-relaxed"
              disabled={busy}
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              spellCheck={false}
            />
          </Field>

          {draftTokens !== null && (
            <p className="text-meta text-[var(--text-muted)]">
              {tf("skillGen.tokens-used", { n: formatTokens(draftTokens) })}
            </p>
          )}

          {generating && (
            <Panel>
              <div
                className="progress-indeterminate"
                aria-label={t("skillGen.regenerating-aria")}
              />
              <p className="text-sm text-[var(--text-muted)]">
                {t("skillGen.regenerating-note")}
              </p>
            </Panel>
          )}
        </>
      )}
    </Modal>
  );
}
