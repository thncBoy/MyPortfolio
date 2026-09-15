"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import ProjectCarousel from "./ProjectCarousel";
import type { Project } from "@/lib/types";
import { FiArrowRight } from "react-icons/fi";

interface ProjectCardProps {
  project: Project;
  index: number;
}

const MAX_TAGS = 3;

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const router = useRouter();
  const visibleTags = project.tech_tags.slice(0, MAX_TAGS);
  const extraTags = project.tech_tags.length - MAX_TAGS;

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
      onClick={() => router.push(`/projects/${project.id}`)}
      className="glass-card overflow-hidden flex flex-col cursor-pointer group"
    >
      {/* Image Carousel */}
      <ProjectCarousel
        images={project.project_images || []}
        aspectRatio="card"
      />

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title */}
        <h3 className="text-base font-semibold mb-3 line-clamp-2 group-hover:text-primary-light transition-colors">
          {project.title}
        </h3>

        {/* Tech Tags */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary-light font-medium"
            >
              {tag}
            </span>
          ))}
          {extraTags > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-surface-hover text-muted font-medium">
              +{extraTags}
            </span>
          )}
        </div>
      </div>

      {/* View Detail Footer */}
      <div className="px-5 pb-4 flex items-center gap-1 text-xs text-muted group-hover:text-primary-light transition-colors">
        <span>ดูรายละเอียด</span>
        <FiArrowRight
          size={13}
          className="group-hover:translate-x-1 transition-transform"
        />
      </div>
    </motion.div>
  );
}
