"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { FiSave, FiCheck } from "react-icons/fi";

const contentKeys = [
  {
    key: "hero_text",
    label: "Hero Text",
    description: "Short intro shown on the hero section",
    rows: 3,
  },
  {
    key: "about",
    label: "About Me",
    description: "Full about section text",
    rows: 8,
  },
];

const socialKeys = [
  {
    key: "social_linkedin",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/your-profile",
  },
  {
    key: "social_github",
    label: "GitHub",
    placeholder: "https://github.com/your-username",
  },
  {
    key: "social_jobthai",
    label: "JobThai",
    placeholder: "https://www.jobthai.com/...",
  },
  {
    key: "social_jobbkk",
    label: "JobBKK",
    placeholder: "https://www.jobbkk.com/...",
  },
];

export default function AdminContent() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const results: Record<string, string> = {};
        for (const item of [...contentKeys, ...socialKeys]) {
          const { data } = await supabase
            .from("site_content")
            .select("value")
            .eq("key", item.key)
            .single();
          results[item.key] = data?.value || "";
        }
        setValues(results);
      } catch (err) {
        console.error("Load content error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (key: string) => {
    setSaving(key);
    try {
      const { error } = await supabase
        .from("site_content")
        .upsert({ key, value: values[key] || "" });

      if (error) throw error;

      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Site Content</h1>

      {loading ? (
        <div className="text-center py-12 text-muted">Loading...</div>
      ) : (
        <div className="space-y-8">
          {/* Text Content */}
          <div className="space-y-6">
            {contentKeys.map((item) => (
              <div key={item.key} className="glass-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{item.label}</h3>
                    <p className="text-xs text-muted">{item.description}</p>
                  </div>
                  <button
                    onClick={() => handleSave(item.key)}
                    disabled={saving === item.key}
                    className={`admin-btn text-sm flex items-center gap-1.5 ${
                      saved === item.key ? "!bg-green-600" : ""
                    }`}
                  >
                    {saving === item.key ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving
                      </>
                    ) : saved === item.key ? (
                      <><FiCheck size={14} /> Saved</>
                    ) : (
                      <><FiSave size={14} /> Save</>
                    )}
                  </button>
                </div>
                <textarea
                  value={values[item.key] || ""}
                  onChange={(e) =>
                    setValues({ ...values, [item.key]: e.target.value })
                  }
                  rows={item.rows}
                  className="admin-input resize-none"
                  placeholder={`Enter ${item.label.toLowerCase()}...`}
                />
              </div>
            ))}
          </div>

          {/* Social & Professional Links */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Social &amp; Professional Links</h2>
            <div className="glass-card p-5 space-y-4">
              {socialKeys.map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <label className="w-24 text-sm font-medium shrink-0">{item.label}</label>
                  <input
                    type="url"
                    value={values[item.key] || ""}
                    onChange={(e) =>
                      setValues({ ...values, [item.key]: e.target.value })
                    }
                    placeholder={item.placeholder}
                    className="admin-input flex-1"
                  />
                  <button
                    onClick={() => handleSave(item.key)}
                    disabled={saving === item.key}
                    className={`admin-btn text-sm flex items-center gap-1.5 shrink-0 ${
                      saved === item.key ? "!bg-green-600" : ""
                    }`}
                  >
                    {saving === item.key ? (
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : saved === item.key ? (
                      <FiCheck size={14} />
                    ) : (
                      <FiSave size={14} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
