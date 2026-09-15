"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  SiNextdotjs,
  SiReact,
  SiNodedotjs,
  SiTailwindcss,
  SiHtml5,
  SiCss,
  SiTypescript,
  SiJavascript,
  SiPython,
  SiMysql,
  SiMongodb,
  SiFirebase,
  SiSupabase,
  SiGit,
  SiGithub,
  SiGithubactions,
  SiVscodium,
  SiFigma,
  SiVercel,
  SiPostman,
  SiDocker,
  SiApple,
  SiRaspberrypi,
  SiGo,
  SiOpenjdk,
  SiC,
  SiDotnet,
} from "react-icons/si";
import { FaWindows } from "react-icons/fa";
import {
  FiMail,
  FiPhone,
  FiGithub,
  FiArrowDown,
  FiMapPin,
  FiCalendar,
  FiFileText,
  FiFile,
  FiAward,
  FiBookOpen,
  FiExternalLink,
  FiDownload,
  FiLinkedin,
  FiBriefcase,
} from "react-icons/fi";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import SkillIcon from "@/components/SkillIcon";
import ProjectCard from "@/components/ProjectCard";
import ContactForm from "@/components/ContactForm";
import type { Project, PortfolioDocument } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";

// ==========================================
// Skills Data
// ==========================================
const skillCategories = [
  {
    title: "Web Development",
    skills: [
      { icon: SiNextdotjs, name: "Next.js" },
      { icon: SiReact, name: "React", color: "#61DAFB" },
      { icon: SiNodedotjs, name: "Node.js", color: "#339933" },
      { icon: SiTailwindcss, name: "Tailwind CSS", color: "#06B6D4" },
      { icon: SiHtml5, name: "HTML", color: "#E34F26" },
      { icon: SiCss, name: "CSS", color: "#1572B6" },
    ],
  },
  {
    title: "Programming",
    skills: [
      { icon: SiTypescript, name: "TypeScript", color: "#3178C6" },
      { icon: SiJavascript, name: "JavaScript", color: "#F7DF1E" },
      { icon: SiPython, name: "Python", color: "#3776AB" },
    ],
  },
  {
    title: "Basic Programming",
    subtitle: "เรียนมาแต่ไม่ได้ใช้เป็นหลัก",
    skills: [
      { icon: SiGo, name: "Go", color: "#00ADD8" },
      { icon: SiOpenjdk, name: "Java (OOP)", color: "#ED8B00" },
      { icon: SiC, name: "C", color: "#A8B9CC" },
      { icon: SiDotnet, name: "C#", color: "#239120" },
    ],
  },
  {
    title: "Databases",
    skills: [
      { icon: SiMysql, name: "MySQL", color: "#4479A1" },
      { icon: SiMongodb, name: "MongoDB", color: "#47A248" },
      { icon: SiFirebase, name: "Firebase", color: "#FFCA28" },
      { icon: SiSupabase, name: "Supabase", color: "#3FCF8E" },
    ],
  },
  {
    title: "Tools & Design",
    skills: [
      { icon: SiGit, name: "Git", color: "#F05032" },
      { icon: SiGithub, name: "GitHub" },
      { icon: SiGithubactions, name: "GitHub Actions" },
      { icon: SiVscodium, name: "VS Code", color: "#007ACC" },
      { icon: SiFigma, name: "Figma", color: "#F24E1E" },
      { icon: SiVercel, name: "Vercel" },
      { icon: SiPostman, name: "Postman", color: "#FF6C37" },
      { icon: SiDocker, name: "Docker", color: "#2496ED" },
    ],
  },
  {
    title: "Systems",
    skills: [
      { icon: SiApple, name: "macOS" },
      { icon: FaWindows, name: "Windows", color: "#0078D4" },
      { icon: SiRaspberrypi, name: "Raspberry Pi", color: "#A22846" },
    ],
  },
];

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return "";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ==========================================
// Page Component
// ==========================================
export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<PortfolioDocument[]>([]);
  const [aboutText, setAboutText] = useState("");
  const [heroText, setHeroText] = useState("");
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch projects with images and links
        const { data: projData } = await supabase
          .from("projects")
          .select("*, project_images(*), project_links(*)")
          .order("display_order", { ascending: true });

        // Sort nested images by display_order
        const sortedProjects = (projData || []).map((p) => ({
          ...p,
          project_images: (p.project_images || []).sort(
            (a: { display_order: number }, b: { display_order: number }) =>
              a.display_order - b.display_order
          ),
        }));

        // Fetch documents (grades, resumes, certs)
        try {
          const { data: docData } = await supabase
            .from("documents")
            .select("*")
            .eq("is_public", true)
            .order("created_at", { ascending: false });

          if (docData) {
            setDocuments(docData as PortfolioDocument[]);
          }
        } catch {
          // Documents table may not exist yet if user hasn't run documents.sql
        }

        // Fetch site content
        const { data: aboutData } = await supabase
          .from("site_content")
          .select("value")
          .eq("key", "about")
          .single();

        const { data: heroData } = await supabase
          .from("site_content")
          .select("value")
          .eq("key", "hero_text")
          .single();

        setProjects(sortedProjects as Project[]);
        setAboutText(aboutData?.value || "");
        setHeroText(heroData?.value || "");

        // Fetch social links
        const socialKeys = ["social_linkedin", "social_github", "social_jobthai", "social_jobbkk"];
        const { data: socialData } = await supabase
          .from("site_content")
          .select("key, value")
          .in("key", socialKeys);
        const socials: Record<string, string> = {};
        (socialData || []).forEach((row: { key: string; value: string }) => {
          socials[row.key] = row.value;
        });
        setSocialLinks(socials);
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoaded(true);
      }
    }
    loadData();
  }, []);

  return (
    <>
      <Navbar />

      {/* ==========================================
          HERO SECTION
          ========================================== */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Gradient Orbs */}
        <div className="gradient-orb w-96 h-96 bg-primary top-1/4 -left-48" />
        <div className="gradient-orb w-80 h-80 bg-accent bottom-1/4 -right-40" />
        <div className="gradient-orb w-64 h-64 bg-purple-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <span className="inline-block px-4 py-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary-light border border-primary/20">
              Fresh Graduate • Open to Work
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-4"
          >
            Hi, I&apos;m{" "}
            <span className="gradient-text">Thanachai</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl text-muted font-medium mb-6"
          >

          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base sm:text-lg text-muted max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {heroText ||
              "Passionate about building modern web applications with clean code and great user experiences. Specializing in Next.js, React, TypeScript, and cloud services."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white font-medium transition-all hover:opacity-90 hover:shadow-lg hover:shadow-primary/25"
            >
              View Projects
            </a>
            <a
              href="#documents"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-primary/30 bg-primary/10 text-primary-light font-medium hover:bg-primary/20 transition-all"
            >
              <FiBookOpen size={16} />
              View Documents / Grades
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-surface-hover transition-all"
            >
              Contact Me
            </a>
          </motion.div>

          {/* Social Icons Row */}
          {Object.values(socialLinks).some(Boolean) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="flex items-center justify-center gap-3 mt-6"
            >
              {socialLinks.social_linkedin && (
                <a
                  href={socialLinks.social_linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn"
                  className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-muted hover:text-[#0A66C2] hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/10 transition-all"
                >
                  <FiLinkedin size={18} />
                </a>
              )}
              {socialLinks.social_github && (
                <a
                  href={socialLinks.social_github}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="GitHub"
                  className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-foreground/40 hover:bg-surface-hover transition-all"
                >
                  <FiGithub size={18} />
                </a>
              )}
              {socialLinks.social_jobthai && (
                <a
                  href={socialLinks.social_jobthai}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="JobThai"
                  className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-muted hover:text-[#00A651]/80 hover:border-[#00A651]/40 hover:bg-[#00A651]/10 transition-all text-xs font-bold"
                >
                  JT
                </a>
              )}
              {socialLinks.social_jobbkk && (
                <a
                  href={socialLinks.social_jobbkk}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="JobBKK"
                  className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center text-muted hover:text-[#E8340E]/80 hover:border-[#E8340E]/40 hover:bg-[#E8340E]/10 transition-all text-xs font-bold"
                >
                  BK
                </a>
              )}
            </motion.div>
          )}
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <FiArrowDown className="text-muted" size={20} />
          </motion.div>
        </motion.div>
      </section>

      {/* ==========================================
          ABOUT SECTION
          ========================================== */}
      <SectionWrapper id="about">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            About <span className="gradient-text">Me</span>
          </h2>
          <div className="glass-card p-6 sm:p-8">
            <p className="text-muted leading-relaxed text-base sm:text-lg whitespace-pre-line">
              {aboutText ||
                "I'm Thanachai Phaktong, a fresh graduate with a passion for software development. I love building modern web applications using technologies like Next.js, React, and TypeScript. I'm always eager to learn new things and take on challenging projects that push me to grow as a developer.\n\nI have experience working with various databases, cloud services, and development tools. I believe in writing clean, maintainable code and creating intuitive user experiences."}
            </p>
          </div>
        </div>
      </SectionWrapper>

      {/* ==========================================
          SKILLS SECTION
          ========================================== */}
      <SectionWrapper id="skills">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Tech <span className="gradient-text">Stack</span>
          </h2>
          <div className="space-y-8">
            {skillCategories.map((category, catIndex) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: catIndex * 0.1 }}
                className="glass-card p-5 sm:p-6"
              >
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-primary-light uppercase tracking-wider">
                    {category.title}
                  </h3>
                  {"subtitle" in category && category.subtitle && (
                    <p className="text-xs text-muted mt-0.5">{category.subtitle}</p>
                  )}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {category.skills.map((skill) => (
                    <SkillIcon
                      key={skill.name}
                      icon={skill.icon}
                      name={skill.name}
                      color={skill.color}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* ==========================================
          PROJECTS SECTION
          ========================================== */}
      <SectionWrapper id="projects">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            My <span className="gradient-text">Projects</span>
          </h2>

          {projects.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <p className="text-muted">
                {loaded
                  ? "Projects coming soon! Add them via the admin panel."
                  : "Loading projects..."}
              </p>
            </div>
          )}
        </div>
      </SectionWrapper>

      {/* ==========================================
          DOCUMENTS & ACADEMIC RECORDS SECTION
          ========================================== */}
      <SectionWrapper id="documents">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Academic Records & <span className="gradient-text">Documents</span>
            </h2>
            <p className="text-sm sm:text-base text-muted mt-2 max-w-xl mx-auto">
              ใบแสดงผลการเรียน (Transcript), เรซูเม่, และเอกสารสำคัญสำหรับประกอบการสมัครงาน
            </p>
          </div>

          {documents.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {documents.map((doc, i) => {
                const isPdf =
                  doc.file_name?.toLowerCase().endsWith(".pdf") ||
                  doc.file_type?.includes("pdf");

                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-5 sm:p-6 flex flex-col justify-between hover:border-primary/40 transition-all group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          {doc.category === "Grade / Transcript" ? (
                            <FiBookOpen size={22} className="text-emerald-400" />
                          ) : doc.category === "Certificate" ? (
                            <FiAward size={22} className="text-amber-400" />
                          ) : isPdf ? (
                            <FiFileText size={22} className="text-red-400" />
                          ) : (
                            <FiFile size={22} />
                          )}
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary-light border border-primary/20">
                          {doc.category}
                        </span>
                      </div>

                      <h3 className="font-semibold text-lg group-hover:text-primary-light transition-colors">
                        {doc.title}
                      </h3>

                      {doc.description && (
                        <p className="text-sm text-muted mt-1.5 line-clamp-2 leading-relaxed">
                          {doc.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-muted mt-3">
                        <span className="truncate max-w-[200px]">{doc.file_name}</span>
                        {doc.file_size ? (
                          <>
                            <span>•</span>
                            <span>{formatFileSize(doc.file_size)}</span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary-light text-sm font-medium transition-all"
                      >
                        <FiExternalLink size={15} />
                        เปิดดูเอกสาร
                      </a>
                      <a
                        href={doc.file_url}
                        download={doc.file_name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg border border-border hover:bg-surface-hover text-muted hover:text-foreground transition-all"
                        title="ดาวน์โหลดไฟล์"
                      >
                        <FiDownload size={16} />
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card p-10 text-center text-muted">
              <div className="w-14 h-14 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto mb-3">
                <FiBookOpen size={24} className="text-muted" />
              </div>
              <p className="font-medium text-foreground">ยังไม่มีเอกสารที่เผยแพร่</p>
              <p className="text-xs mt-1">
                {loaded
                  ? "สามารถอัพโหลดใบเกรดและไฟล์ต่างๆ ได้ที่ Admin Panel"
                  : "กำลังโหลดข้อมูล..."}
              </p>
            </div>
          )}
        </div>
      </SectionWrapper>

      {/* ==========================================
          CONTACT SECTION
          ========================================== */}
      <SectionWrapper id="contact">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Get in <span className="gradient-text">Touch</span>
          </h2>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Contact Info */}
            <div className="md:col-span-2 space-y-4">
              <p className="text-muted leading-relaxed mb-6">
                I&apos;m always open to new opportunities and collaborations.
                Feel free to reach out!
              </p>

              <a
                href="mailto:thanachai.bo2546@gmail.com"
                className="glass-card p-4 flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <FiMail size={18} />
                </div>
                <div>
                  <p className="text-xs text-muted">Email</p>
                  <p className="text-sm font-medium">
                    thanachai.bo2546@gmail.com
                  </p>
                </div>
              </a>

              <a
                href="tel:+66617932167"
                className="glass-card p-4 flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <FiPhone size={18} />
                </div>
                <div>
                  <p className="text-xs text-muted">Phone</p>
                  <p className="text-sm font-medium">061-793-2167</p>
                </div>
              </a>

              <a
                href="https://github.com/thncBoy"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-4 flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <FiGithub size={18} />
                </div>
                <div>
                  <p className="text-xs text-muted">GitHub</p>
                  <p className="text-sm font-medium">github.com/thncBoy</p>
                </div>
              </a>

              {/* Professional Platforms */}
              {Object.values(socialLinks).some(Boolean) && (
                <div className="pt-2">
                  <p className="text-xs text-muted font-medium mb-3">หาผมได้ที่</p>
                  <div className="space-y-2">
                    {socialLinks.social_linkedin && (
                      <a
                        href={socialLinks.social_linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-card p-4 flex items-center gap-3 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#0A66C2]/10 flex items-center justify-center text-[#0A66C2] group-hover:bg-[#0A66C2] group-hover:text-white transition-all">
                          <FiLinkedin size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-muted">LinkedIn</p>
                          <p className="text-sm font-medium">โปรไฟล์ LinkedIn</p>
                        </div>
                      </a>
                    )}
                    {socialLinks.social_jobthai && (
                      <a
                        href={socialLinks.social_jobthai}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-card p-4 flex items-center gap-3 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#00A651]/10 flex items-center justify-center text-[#00A651] group-hover:bg-[#00A651] group-hover:text-white transition-all text-xs font-bold">
                          JT
                        </div>
                        <div>
                          <p className="text-xs text-muted">JobThai</p>
                          <p className="text-sm font-medium">โปรไฟล์ JobThai</p>
                        </div>
                      </a>
                    )}
                    {socialLinks.social_jobbkk && (
                      <a
                        href={socialLinks.social_jobbkk}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-card p-4 flex items-center gap-3 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#E8340E]/10 flex items-center justify-center text-[#E8340E] group-hover:bg-[#E8340E] group-hover:text-white transition-all text-xs font-bold">
                          BK
                        </div>
                        <div>
                          <p className="text-xs text-muted">JobBKK</p>
                          <p className="text-sm font-medium">โปรไฟล์ JobBKK</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div className="md:col-span-3 glass-card p-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </SectionWrapper>

      <Footer />
    </>
  );
}
