"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiFolder } from "react-icons/fi";

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*, project_images(*)")
        .order("display_order", { ascending: true });

      if (error) throw error;

      // Sort nested images by display_order
      const sorted = (data || []).map((p) => ({
        ...p,
        project_images: (p.project_images || []).sort(
          (a: { display_order: number }, b: { display_order: number }) =>
            a.display_order - b.display_order
        ),
      }));

      setProjects(sorted as Project[]);
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
      // Get images to delete from storage
      const { data: images } = await supabase
        .from("project_images")
        .select("storage_path")
        .eq("project_id", id);

      // Delete from storage
      const paths = (images || [])
        .map((img) => img.storage_path)
        .filter(Boolean);
      if (paths.length > 0) {
        await supabase.storage.from("project-images").remove(paths);
      }

      // Delete project (cascades to images and links)
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;

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
                {project.project_images && project.project_images.length > 0 ? (
                  <img
                    src={project.project_images[0].image_url}
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
                  {project.tech_tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary-light"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tech_tags.length > 4 && (
                    <span className="text-[10px] text-muted">
                      +{project.tech_tags.length - 4}
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
