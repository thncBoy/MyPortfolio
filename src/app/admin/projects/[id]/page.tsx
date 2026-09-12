"use client";

import { useEffect, useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  FiSave,
  FiPlus,
  FiTrash2,
  FiX,
  FiArrowLeft,
  FiImage,
  FiLink,
  FiUploadCloud,
} from "react-icons/fi";

interface ImageItem {
  id?: string;
  image_url: string;
  storage_path: string;
  display_order: number;
}

interface LinkItem {
  id?: string;
  label: string;
  url: string;
}

export default function ProjectEditPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const isNew = projectId === "new";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techInput, setTechInput] = useState("");
  const [techTags, setTechTags] = useState<string[]>([]);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  // Load existing project
  useEffect(() => {
    if (isNew) return;

    async function load() {
      try {
        const { data: proj, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();

        if (error || !proj) {
          router.push("/admin/projects");
          return;
        }

        setTitle(proj.title || "");
        setDescription(proj.description || "");
        setTechTags(proj.tech_tags || []);
        setDisplayOrder(proj.display_order || 0);

        // Load images
        const { data: imagesData } = await supabase
          .from("project_images")
          .select("*")
          .eq("project_id", projectId)
          .order("display_order", { ascending: true });

        setImages(
          (imagesData || []).map((d) => ({
            id: d.id,
            image_url: d.image_url,
            storage_path: d.storage_path || "",
            display_order: d.display_order,
          }))
        );

        // Load links
        const { data: linksData } = await supabase
          .from("project_links")
          .select("*")
          .eq("project_id", projectId);

        setLinks(
          (linksData || []).map((d) => ({
            id: d.id,
            label: d.label,
            url: d.url,
          }))
        );
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isNew, projectId, router]);

  // Handle tech tag input
  const addTag = () => {
    const tag = techInput.trim();
    if (tag && !techTags.includes(tag)) {
      setTechTags([...techTags, tag]);
      setTechInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTechTags(techTags.filter((t) => t !== tag));
  };

  // Handle file upload
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Generate unique filename
        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const storagePath = `projects/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from("project-images")
          .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("project-images")
          .getPublicUrl(storagePath);

        setImages((prev) => [
          ...prev,
          {
            image_url: urlData.publicUrl,
            storage_path: storagePath,
            display_order: prev.length,
          },
        ]);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = async (index: number) => {
    const img = images[index];

    // Delete from storage if has storage_path
    if (img.storage_path) {
      await supabase.storage
        .from("project-images")
        .remove([img.storage_path]);
    }

    // Delete from database if has id
    if (img.id) {
      await supabase
        .from("project_images")
        .delete()
        .eq("id", img.id);
    }

    setImages(images.filter((_, i) => i !== index));
  };

  // Handle links
  const addLink = () => {
    setLinks([...links, { label: "", url: "" }]);
  };

  const updateLink = (index: number, field: "label" | "url", value: string) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
  };

  const removeLink = async (index: number) => {
    const link = links[index];
    if (link.id) {
      await supabase.from("project_links").delete().eq("id", link.id);
    }
    setLinks(links.filter((_, i) => i !== index));
  };

  // Save
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);

    try {
      let docId = projectId;

      const projectData = {
        title: title.trim(),
        description: description.trim(),
        tech_tags: techTags,
        display_order: displayOrder,
      };

      if (isNew) {
        const { data: newProj, error } = await supabase
          .from("projects")
          .insert(projectData)
          .select("id")
          .single();

        if (error) throw error;
        docId = newProj.id;
      } else {
        const { error } = await supabase
          .from("projects")
          .update(projectData)
          .eq("id", projectId);

        if (error) throw error;
      }

      // Save images
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.id) {
          // Update existing
          await supabase
            .from("project_images")
            .update({
              display_order: i,
              image_url: img.image_url,
              storage_path: img.storage_path,
            })
            .eq("id", img.id);
        } else {
          // Insert new
          await supabase.from("project_images").insert({
            project_id: docId,
            image_url: img.image_url,
            storage_path: img.storage_path,
            display_order: i,
          });
        }
      }

      // Save links
      for (const link of links) {
        if (!link.label.trim() || !link.url.trim()) continue;
        if (link.id) {
          await supabase
            .from("project_links")
            .update({
              label: link.label.trim(),
              url: link.url.trim(),
            })
            .eq("id", link.id);
        } else {
          await supabase.from("project_links").insert({
            project_id: docId,
            label: link.label.trim(),
            url: link.url.trim(),
          });
        }
      }

      router.push("/admin/projects");
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-muted">Loading project...</div>
    );
  }

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => router.push("/admin/projects")}
        className="flex items-center gap-2 text-sm text-muted hover:text-foreground mb-4 transition-colors"
      >
        <FiArrowLeft size={16} />
        Back to Projects
      </button>

      <h1 className="text-2xl font-bold mb-6">
        {isNew ? "New Project" : "Edit Project"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="project-title" className="block text-sm font-medium mb-1.5">
            Title *
          </label>
          <input
            id="project-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project name"
            required
            className="admin-input"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="project-desc" className="block text-sm font-medium mb-1.5">
            Description
          </label>
          <textarea
            id="project-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your project..."
            rows={4}
            className="admin-input resize-none"
          />
        </div>

        {/* Display Order */}
        <div>
          <label htmlFor="project-order" className="block text-sm font-medium mb-1.5">
            Display Order
          </label>
          <input
            id="project-order"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
            className="admin-input w-32"
          />
        </div>

        {/* Tech Tags */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Tech Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add tag (press Enter)"
              className="admin-input flex-1"
            />
            <button type="button" onClick={addTag} className="admin-btn-secondary admin-btn px-3">
              <FiPlus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {techTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary-light"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-400 transition-colors"
                >
                  <FiX size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Images — File Upload to Supabase Storage */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            <FiImage className="inline mr-1" size={14} />
            Project Images
          </label>

          {/* Existing images */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative aspect-video rounded-lg overflow-hidden bg-surface-hover group"
              >
                <img
                  src={img.image_url}
                  alt={`Image ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120' fill='%23666'%3E%3Crect width='200' height='120' fill='%23222'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='14'%3EImage Error%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="p-2 rounded-full bg-red-500 text-white"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
                <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded">
                  #{i + 1}
                </span>
              </div>
            ))}
          </div>

          {/* Upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <FiUploadCloud className="mx-auto text-muted mb-2" size={28} />
            <p className="text-sm text-muted">
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : (
                <>
                  คลิกเพื่อเลือกรูป หรือลากไฟล์มาวาง
                  <br />
                  <span className="text-xs text-muted/70">PNG, JPG, WEBP (สูงสุด 5MB)</span>
                </>
              )}
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Links */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            <FiLink className="inline mr-1" size={14} />
            Links
          </label>
          <div className="space-y-2 mb-2">
            {links.map((link, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateLink(i, "label", e.target.value)}
                  placeholder="Label (e.g. GitHub)"
                  className="admin-input w-32"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateLink(i, "url", e.target.value)}
                  placeholder="https://..."
                  className="admin-input flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeLink(i)}
                  className="p-2 text-muted hover:text-red-400 transition-colors"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addLink}
            className="text-sm text-primary hover:text-primary-light flex items-center gap-1 transition-colors"
          >
            <FiPlus size={14} />
            Add Link
          </button>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            type="submit"
            disabled={saving}
            className="admin-btn flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FiSave size={16} />
                {isNew ? "Create Project" : "Save Changes"}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/projects")}
            className="admin-btn admin-btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
