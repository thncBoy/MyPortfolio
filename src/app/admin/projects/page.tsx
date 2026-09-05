"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Project } from "@/lib/types";
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiFolder } from "react-icons/fi";

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      const q = query(
        collection(db, "projects"),
        orderBy("displayOrder", "asc")
      );
      const snap = await getDocs(q);
      const items: Project[] = [];

      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        const imagesSnap = await getDocs(
          query(
            collection(db, "projects", docSnap.id, "images"),
            orderBy("displayOrder", "asc")
          )
        );
        items.push({
          id: docSnap.id,
          title: data.title,
          description: data.description,
          techTags: data.techTags || [],
          displayOrder: data.displayOrder || 0,
          createdAt: data.createdAt || "",
          images: imagesSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as Project["images"],
        });
      }

      setProjects(items);
    } catch (err) {
      console.error("Load projects error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setDeleting(id);
    try {
      // Delete subcollections first
      const imagesSnap = await getDocs(
        collection(db, "projects", id, "images")
      );
      const linksSnap = await getDocs(
        collection(db, "projects", id, "links")
      );
      for (const d of imagesSnap.docs) {
        await deleteDoc(doc(db, "projects", id, "images", d.id));
      }
      for (const d of linksSnap.docs) {
        await deleteDoc(doc(db, "projects", id, "links", d.id));
      }
      await deleteDoc(doc(db, "projects", id));
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete project");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link href="/admin/projects/new" className="admin-btn flex items-center gap-2">
          <FiPlus size={16} />
          Add Project
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 glass-card">
          <FiFolder className="mx-auto text-muted mb-3" size={40} />
          <p className="text-muted mb-4">No projects yet</p>
          <Link href="/admin/projects/new" className="admin-btn inline-flex items-center gap-2">
            <FiPlus size={16} />
            Add Your First Project
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="glass-card p-4 flex items-center gap-4"
            >
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg bg-surface-hover flex items-center justify-center shrink-0 overflow-hidden">
                {project.images && project.images.length > 0 ? (
                  <img
                    src={project.images[0].imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiImage className="text-muted" size={20} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{project.title}</h3>
                <p className="text-sm text-muted truncate">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.techTags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary-light"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.techTags.length > 4 && (
                    <span className="text-[10px] text-muted">
                      +{project.techTags.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="p-2 rounded-lg hover:bg-surface-hover text-muted hover:text-primary transition-all"
                >
                  <FiEdit2 size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(project.id)}
                  disabled={deleting === project.id}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-all disabled:opacity-50"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
