import { FiGithub, FiMail, FiPhone, FiHeart } from "react-icons/fi";
import ViewCounter from "./ViewCounter";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left — Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-lg font-bold gradient-text">TC.</span>
            <p className="text-xs text-muted">
              Built with <FiHeart className="inline w-3 h-3 text-red-400" /> using Next.js & supabase
            </p>
          </div>

          {/* Center — View Counter */}
          <ViewCounter />

          {/* Right — Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="mailto:thanachai.bo2546@gmail.com"
              className="text-muted hover:text-primary transition-colors"
              aria-label="Email"
            >
              <FiMail size={18} />
            </a>
            <a
              href="tel:+66617932167"
              className="text-muted hover:text-primary transition-colors"
              aria-label="Phone"
            >
              <FiPhone size={18} />
            </a>
            <a
              href="https://github.com/thncBoy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <FiGithub size={18} />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border text-center text-xs text-muted">
          © {new Date().getFullYear()} Thanachai Phaktong. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
