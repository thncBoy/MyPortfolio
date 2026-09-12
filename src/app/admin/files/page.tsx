"use client";

import { useEffect, useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import type { PortfolioDocument } from "@/lib/types";
import {
  FiUploadCloud,
  FiFileText,
  FiTrash2,
  FiExternalLink,
  FiCopy,
  FiCheck,
  FiAlertCircle,
  FiFile,
  FiImage,
  FiAward,
  FiBookOpen,
} from "react-icons/fi";

const CATEGORIES = [
  { id: "Grade / Transcript", label: "ใบเกรด / Transcript", icon: FiBookOpen },
  { id: "Resume", label: "เรซูเม่ (Resume / CV)", icon: FiFileText },
  { id: "Certificate", label: "ใบรับรอง / เกียรติบัตร", icon: FiAward },
  { id: "Other", label: "เอกสารทั่วไป (Other)", icon: FiFile },
];

function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function AdminFilesPage() {
  const [documents, setDocuments] = useState<PortfolioDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [tableMissing, setTableMissing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Grade / Transcript");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: fetchErr } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchErr) {
        if (fetchErr.message?.includes("does not exist") || fetchErr.message?.includes("schema cache")) {
          setTableMissing(true);
        } else {
          setError(fetchErr.message);
        }
      } else {
        setDocuments(data || []);
        setTableMissing(false);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        // Auto fill title from filename without extension
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setTitle(cleanName);
      }
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("กรุณาเลือกไฟล์ที่ต้องการอัพโหลด");
      return;
    }
    if (!title.trim()) {
      setError("กรุณาระบุชื่อเอกสาร");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // 1. Upload to Supabase Storage 'documents' bucket
      const timestamp = Date.now();
      const sanitizedName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const storagePath = `uploads/${timestamp}_${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storagePath, selectedFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(storagePath);

      const fileUrl = urlData.publicUrl;

      // 3. Save metadata to 'documents' table
      const { data: insertData, error: insertError } = await supabase
        .from("documents")
        .insert({
          title: title.trim(),
          description: description.trim(),
          category,
          file_url: fileUrl,
          storage_path: storagePath,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          file_type: selectedFile.type,
          is_public: isPublic,
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.message?.includes("does not exist")) {
          setTableMissing(true);
        }
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      // Reset form
      setSelectedFile(null);
      setTitle("");
      setDescription("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh document list
      if (insertData) {
        setDocuments((prev) => [insertData, ...prev]);
      } else {
        loadDocuments();
      }
    } catch (err: any) {
      setError(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc: PortfolioDocument) => {
    if (!confirm(`คุณต้องการลบไฟล์ "${doc.title}" ใช่หรือไม่?`)) return;

    try {
      // Delete from storage
      if (doc.storage_path) {
        await supabase.storage.from("documents").remove([doc.storage_path]);
      }

      // Delete from database
      const { error: delError } = await supabase
        .from("documents")
        .delete()
        .eq("id", doc.id);

      if (delError) throw delError;

      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err: any) {
      alert(`ลบไม่สำเร็จ: ${err?.message}`);
    }
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case "Grade / Transcript":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Resume":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Certificate":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Files & Documents</h1>
        <p className="text-sm text-muted mt-1">
          อัพโหลดและจัดการไฟล์ เช่น ใบเกรด (Transcript), Resume, เกียรติบัตร และเอกสารต่างๆ
        </p>
      </div>

      {/* Missing Table Warning */}
      {tableMissing && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="text-amber-400 shrink-0 mt-0.5" size={20} />
            <div className="text-sm space-y-2">
              <p className="font-semibold text-amber-300">
                ยังไม่ได้สร้างตาราง documents ใน Supabase
              </p>
              <p>
                กรุณานำคำสั่งจากไฟล์ <code className="px-1.5 py-0.5 rounded bg-black/40 font-mono text-xs">supabase/documents.sql</code> ไปวางและกด <strong>Run</strong> ใน Supabase Dashboard → <strong>SQL Editor</strong> 1 ครั้ง
              </p>
              <button
                onClick={loadDocuments}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-medium transition-colors"
              >
                ลองโหลดใหม่อีกครั้ง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && !tableMissing && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <FiAlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="glass-card p-6 sm:p-8">
        <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
          <FiUploadCloud className="text-primary" size={20} />
          อัพโหลดเอกสารใหม่
        </h2>

        <form onSubmit={handleUpload} className="space-y-5">
          {/* File Picker */}
          <div>
            <label className="block text-sm font-medium mb-2">เลือกไฟล์เอกสาร (PDF, รูปภาพ, เอกสาร)</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-surface/50 hover:bg-surface"
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.zip"
              />
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <FiUploadCloud size={24} />
              </div>
              {selectedFile ? (
                <div>
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted mt-1">{formatBytes(selectedFile.size)}</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่</p>
                  <p className="text-xs text-muted mt-1">รองรับ PDF, PNG, JPG, DOCX (เช่น ใบเกรด, เรซูเม่)</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">ชื่อเอกสาร *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น ใบแสดงผลการเรียน (Transcript / Grade Report)"
                required
                className="admin-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">หมวดหมู่เอกสาร</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="admin-input"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">คำอธิบายเพิ่มเติม (ไม่บังคับ)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เช่น เกรดเฉลี่ยสะสมตลอดหลักสูตร (GPAX) สาขาวิทยาการคอมพิวเตอร์"
              className="admin-input"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span>แสดงไฟล์นี้บนหน้าเว็บไซต์ Portfolio</span>
            </label>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="admin-btn flex items-center gap-2 px-6 py-2.5"
            >
              {uploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังอัพโหลด...
                </>
              ) : (
                <>
                  <FiUploadCloud size={18} />
                  อัพโหลดไฟล์
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Document List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            เอกสารทั้งหมด ({documents.length})
          </h2>
          <button
            onClick={loadDocuments}
            className="text-xs text-muted hover:text-primary transition-colors"
          >
            รีเฟรชรายการ
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted">กำลังโหลดเอกสาร...</div>
        ) : documents.length === 0 ? (
          <div className="glass-card p-10 text-center text-muted">
            <div className="w-14 h-14 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto mb-3">
              <FiFile size={24} className="text-muted" />
            </div>
            <p className="font-medium text-foreground">ยังไม่มีเอกสารในระบบ</p>
            <p className="text-xs mt-1">อัพโหลดใบเกรด, เรซูเม่ หรือไฟล์เอกสารของคุณด้านบนได้เลย</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => {
              const isPdf = doc.file_name?.toLowerCase().endsWith(".pdf") || doc.file_type?.includes("pdf");
              const isImg = doc.file_type?.includes("image") || /\.(jpg|jpeg|png|webp)$/i.test(doc.file_name);

              return (
                <div
                  key={doc.id}
                  className="glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      {isPdf ? (
                        <FiFileText size={22} className="text-red-400" />
                      ) : isImg ? (
                        <FiImage size={22} className="text-blue-400" />
                      ) : (
                        <FiFile size={22} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-base truncate">{doc.title}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getCategoryBadgeClass(doc.category)}`}>
                          {doc.category}
                        </span>
                        {!doc.is_public && (
                          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                            Private
                          </span>
                        )}
                      </div>
                      {doc.description && (
                        <p className="text-xs text-muted mt-1 line-clamp-1">{doc.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted mt-1.5">
                        <span>{doc.file_name}</span>
                        <span>•</span>
                        <span>{formatBytes(doc.file_size)}</span>
                        {doc.created_at && (
                          <>
                            <span>•</span>
                            <span>{new Date(doc.created_at).toLocaleDateString("th-TH")}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleCopyLink(doc.file_url, doc.id)}
                      className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                      title="คัดลอกลิงก์ไฟล์"
                    >
                      {copiedId === doc.id ? <FiCheck className="text-green-400" size={16} /> : <FiCopy size={16} />}
                    </button>

                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-muted hover:text-primary hover:bg-surface-hover transition-colors"
                      title="เปิดดูไฟล์"
                    >
                      <FiExternalLink size={16} />
                    </a>

                    <button
                      onClick={() => handleDelete(doc)}
                      className="p-2 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="ลบเอกสาร"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
