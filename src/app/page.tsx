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
} from "react-icons/si";
import { FaWindows } from "react-icons/fa";
import {
  FiMail,
  FiPhone,
  FiGithub,
  FiArrowDown,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import SkillIcon from "@/components/SkillIcon";
import ProjectCard from "@/components/ProjectCard";
import ContactForm from "@/components/ContactForm";
import type { Project, Experience, Education } from "@/lib/types";

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

// ==========================================
// Helper: Fetch data from Firestore (client-side)
// ==========================================
async function fetchCollection<T>(collectionName: string): Promise<T[]> {
  try {
    const { db } = await import("@/lib/firebase/config");
    const { collection, getDocs, query, orderBy } = await import(
      "firebase/firestore"
    );

    const orderField =
      collectionName === "pageViews" ? "visitedAt" : "displayOrder";
    const q = query(collection(db, collectionName), orderBy(orderField, "asc"));
    const snap = await getDocs(q);

    const items: T[] = [];
    for (const docSnap of snap.docs) {
      const data = docSnap.data();

      if (collectionName === "projects") {
        // Fetch subcollections for images and links
        const imagesSnap = await getDocs(
          query(
            collection(db, "projects", docSnap.id, "images"),
            orderBy("displayOrder", "asc")
          )
        );
        const linksSnap = await getDocs(
          collection(db, "projects", docSnap.id, "links")
        );

        items.push({
          id: docSnap.id,
          ...data,
          images: imagesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
          links: linksSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        } as T);
      } else {
        items.push({ id: docSnap.id, ...data } as T);
      }
    }
    return items;
  } catch {
    return [];
  }
}

async function fetchSiteContent(key: string): Promise<string> {
  try {
    const { db } = await import("@/lib/firebase/config");
    const { doc, getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, "siteContent", key));
    return snap.exists() ? snap.data().value : "";
  } catch {
    return "";
  }
}

// ==========================================
// Page Component
// ==========================================
export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [aboutText, setAboutText] = useState("");
  const [heroText, setHeroText] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [proj, exp, edu, about, hero] = await Promise.all([
        fetchCollection<Project>("projects"),
        fetchCollection<Experience>("experience"),
        fetchCollection<Education>("education"),
        fetchSiteContent("about"),
        fetchSiteContent("hero_text"),
      ]);
      setProjects(proj);
      setExperiences(exp);
      setEducations(edu);
      setAboutText(about);
      setHeroText(hero);
      setLoaded(true);
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
            Software Developer
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
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-surface-hover transition-all"
            >
              Contact Me
            </a>
          </motion.div>
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
                <h3 className="text-sm font-semibold text-primary-light uppercase tracking-wider mb-4">
                  {category.title}
                </h3>
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
          EXPERIENCE SECTION
          ========================================== */}
      <SectionWrapper id="experience">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Work <span className="gradient-text">Experience</span>
          </h2>

          {experiences.length > 0 ? (
            <div className="relative">
              <div className="timeline-line" />
              <div className="space-y-8">
                {experiences.map((exp, i) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className={`relative pl-12 md:pl-0 md:w-1/2 ${
                      i % 2 === 0
                        ? "md:pr-12 md:text-right"
                        : "md:ml-auto md:pl-12"
                    }`}
                  >
                    <div className="absolute left-[14px] md:left-auto md:right-auto top-1 timeline-dot" style={{
                      ...(i % 2 === 0
                        ? { right: undefined, left: '14px', [`${'@media (min-width: 768px)' as string}`]: { right: '-6px', left: 'auto' } }
                        : {})
                    }} />
                    <div
                      className="absolute top-1 timeline-dot"
                      style={{
                        left: "14px",
                      }}
                    />
                    <div className="glass-card p-5">
                      <h3 className="font-semibold text-lg">{exp.title}</h3>
                      <p className="text-primary-light text-sm font-medium">
                        {exp.company}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted mt-1 md:justify-start">
                        <FiCalendar size={12} />
                        <span>
                          {exp.startDate} —{" "}
                          {exp.endDate || "Present"}
                        </span>
                      </div>
                      <p className="text-sm text-muted mt-3 leading-relaxed whitespace-pre-line">
                        {exp.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted">
              <p>
                {loaded
                  ? "Experience will be added via the admin panel."
                  : "Loading..."}
              </p>
            </div>
          )}
        </div>
      </SectionWrapper>

      {/* ==========================================
          EDUCATION SECTION
          ========================================== */}
      <SectionWrapper id="education">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            <span className="gradient-text">Education</span>
          </h2>

          {educations.length > 0 ? (
            <div className="space-y-6">
              {educations.map((edu, i) => (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-5 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-lg">{edu.degree}</h3>
                      <p className="text-primary-light text-sm font-medium flex items-center gap-1.5">
                        <FiMapPin size={12} />
                        {edu.institution}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted shrink-0">
                      <FiCalendar size={12} />
                      <span>
                        {edu.startDate} — {edu.endDate || "Present"}
                      </span>
                    </div>
                  </div>
                  {edu.description && (
                    <p className="text-sm text-muted mt-3 leading-relaxed whitespace-pre-line">
                      {edu.description}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted">
              <p>
                {loaded
                  ? "Education will be added via the admin panel."
                  : "Loading..."}
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
