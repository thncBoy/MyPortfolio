"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import ProjectCarousel from "@/components/ProjectCarousel";
import {
  FiArrowLeft,
  FiExternalLink,
  FiGithub,
  FiCheckCircle,
  FiCode,
  FiLayers,
} from "react-icons/fi";

function getLinkIcon(label: string) {
  const lower = label.toLowerCase();
  if (lower.includes("github")) return <FiGithub size={16} />;
  return <FiExternalLink size={16} />;
}

function getTechColor(tag: string): string {
  const colors: Record<string, string> = {
    react: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    nextjs: "bg-slate-500/10 text-slate-300 border-slate-500/20",
    "next.js": "bg-slate-500/10 text-slate-300 border-slate-500/20",
    typescript: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    javascript: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    python: "bg-green-500/10 text-green-400 border-green-500/20",
    tailwind: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    tailwindcss: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    supabase: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    firebase: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    postgresql: "bg-blue-600/10 text-blue-300 border-blue-600/20",
    nodejs: "bg-green-600/10 text-green-300 border-green-600/20",
    "node.js": "bg-green-600/10 text-green-300 border-green-600/20",
    vue: "bg-green-500/10 text-green-400 border-green-500/20",
    angular: "bg-red-500/10 text-red-400 border-red-500/20",
    prisma: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    mongodb: "bg-green-700/10 text-green-300 border-green-700/20",
    docker: "bg-blue-400/10 text-blue-300 border-blue-400/20",
  };
  return (
    colors[tag.toLowerCase()] ??
    "bg-primary/10 text-primary-light border-primary/20"
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("projects")
        .select("*, project_images(*), project_links(*)")
        .eq("id", projectId)
        .single();

      if (error || !data) {
        router.push("/#projects");
        return;
      }

      const sorted = {
        ...data,
        features: data.features ?? [],
        project_images: (data.project_images ?? []).sort(
          (a: { display_order: number }, b: { display_order: number }) =>
            a.display_order - b.display_order
        ),
      };
      setProject(sorted as Project);
      setLoading(false);
    }
    load();
  }, [projectId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  const validLinks = (project.project_links ?? []).filter(
    (l) => l.url?.trim() && l.label?.trim()
  );

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => router.push("/#projects")}
          className="flex items-center gap-2 text-sm text-muted hover:text-foreground mb-8 transition-colors group"
        >
          <FiArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          กลับไปยังโปรเจก
        </motion.button>

        <div className="space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              {project.title}
            </h1>

            {/* Links */}
            {validLinks.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {validLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-primary/10 hover:bg-primary/20 text-primary-light border border-primary/20 hover:border-primary/40 transition-all"
                  >
                    {getLinkIcon(link.label)}
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </motion.div>

          {/* Image carousel */}
          {(project.project_images ?? []).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-2xl overflow-hidden border border-border"
            >
              <ProjectCarousel
                images={project.project_images ?? []}
              />
            </motion.div>
          )}

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="glass-card p-6"
          >
            <p className="text-muted leading-relaxed text-base whitespace-pre-line">
              {project.description}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Tech Stack */}
            {project.tech_tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="glass-card p-6"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiCode className="text-primary" size={18} />
                  Tech Stack
                </h2>
                <div className="flex flex-wrap gap-2">
                  {project.tech_tags.map((tag) => (
                    <span
                      key={tag}
                      className={`px-3 py-1 text-sm font-medium rounded-lg border ${getTechColor(tag)}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Key Features */}
            {project.features && project.features.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="glass-card p-6"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FiLayers className="text-primary" size={18} />
                  Key Features
                </h2>
                <ul className="space-y-2">
                  {project.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted">
                      <FiCheckCircle
                        size={15}
                        className="text-primary shrink-0 mt-0.5"
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
