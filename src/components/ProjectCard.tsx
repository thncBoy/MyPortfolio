"use client";

import { motion } from "framer-motion";
import { FiExternalLink, FiGithub } from "react-icons/fi";
import ProjectCarousel from "./ProjectCarousel";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
  index: number;
}

function getLinkIcon(label: string) {
  const lower = label.toLowerCase();
  if (lower.includes("github")) return <FiGithub size={14} />;
  return <FiExternalLink size={14} />;
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="glass-card overflow-hidden flex flex-col"
    >
      {/* Image Carousel */}
      <ProjectCarousel images={project.images || []} />

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
        <p className="text-sm text-muted leading-relaxed mb-4 flex-1">
          {project.description}
        </p>

        {/* Tech Tags */}
        {project.techTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.techTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary-light font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        {project.links && project.links.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
            {project.links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-hover hover:bg-primary/10 hover:text-primary transition-all"
              >
                {getLinkIcon(link.label)}
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
