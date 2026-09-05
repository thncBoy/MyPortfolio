"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "@/lib/firebase/config";
import {
  FiSave,
  FiPlus,
  FiTrash2,
  FiUpload,
  FiX,
  FiArrowLeft,
  FiImage,
  FiLink,
} from "react-icons/fi";

interface ImageItem {
  id?: string;
  imageUrl: string;
  storagePath: string;
  displayOrder: number;
  file?: File;
  preview?: string;
  isNew?: boolean;
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

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techInput, setTechInput] = useState("");
  const [techTags, setTechTags] = useState<string[]>([]);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);

  // Load existing project
  useEffect(() => {
    if (isNew) return;

    async function load() {
      try {
        const projDoc = await getDoc(doc(db, "projects", projectId));
        if (!projDoc.exists()) {
          router.push("/admin/projects");
          return;
        }
        const data = projDoc.data();
        setTitle(data.title || "");
        setDescription(data.description || "");
        setTechTags(data.techTags || []);
        setDisplayOrder(data.displayOrder || 0);

        // Load images
        const imagesSnap = await getDocs(
          query(
            collection(db, "projects", projectId, "images"),
            orderBy("displayOrder", "asc")
          )
        );
        setImages(
          imagesSnap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ImageItem, "id">),
          }))
        );

        // Load links
        const linksSnap = await getDocs(
          collection(db, "projects", projectId, "links")
        );
        setLinks(
          linksSnap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<LinkItem, "id">),
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

  // Handle image upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageItem[] = Array.from(files).map((file, i) => ({
      imageUrl: "",
      storagePath: "",
      displayOrder: images.length + i,
      file,
      preview: URL.createObjectURL(file),
      isNew: true,
    }));

    setImages([...images, ...newImages]);
    e.target.value = "";
  };

  const removeImage = async (index: number) => {
    const img = images[index];
    if (img.id && img.storagePath) {
      try {
        await deleteObject(ref(storage, img.storagePath));
        await deleteDoc(
          doc(db, "projects", projectId, "images", img.id)
        );
      } catch (err) {
        console.error("Delete image error:", err);
      }
    }
    if (img.preview) URL.revokeObjectURL(img.preview);
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
      try {
        await deleteDoc(doc(db, "projects", projectId, "links", link.id));
      } catch (err) {
        console.error("Delete link error:", err);
      }
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
        techTags,
        displayOrder,
        createdAt: new Date().toISOString(),
      };

      if (isNew) {
        const newDoc = await addDoc(collection(db, "projects"), projectData);
        docId = newDoc.id;
      } else {
        await updateDoc(doc(db, "projects", projectId), projectData);
      }

      // Upload new images
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.isNew && img.file) {
          const storagePath = `projects/${docId}/${Date.now()}_${img.file.name}`;
          const storageRef = ref(storage, storagePath);
          await uploadBytes(storageRef, img.file);
          const imageUrl = await getDownloadURL(storageRef);

          await addDoc(collection(db, "projects", docId, "images"), {
            imageUrl,
            storagePath,
            displayOrder: i,
          });
        } else if (img.id) {
          // Update display order
          await updateDoc(
            doc(db, "projects", docId, "images", img.id),
            { displayOrder: i }
          );
        }
      }

      // Save links
      // Delete existing links that were removed (handled in removeLink)
      // Add/update remaining links
      for (const link of links) {
        if (!link.label.trim() || !link.url.trim()) continue;
        if (link.id) {
          await updateDoc(doc(db, "projects", docId, "links", link.id), {
            label: link.label.trim(),
            url: link.url.trim(),
          });
        } else {
          await addDoc(collection(db, "projects", docId, "links"), {
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

        {/* Images */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            <FiImage className="inline mr-1" size={14} />
            Project Images
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative aspect-video rounded-lg overflow-hidden bg-surface-hover group"
              >
                <img
                  src={img.preview || img.imageUrl}
                  alt={`Image ${i + 1}`}
                  className="w-full h-full object-cover"
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

            {/* Upload Button */}
            <label className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
              <FiUpload className="text-muted mb-1" size={20} />
              <span className="text-xs text-muted">Upload</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          </div>
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
