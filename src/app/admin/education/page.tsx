"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Education } from "@/lib/types";
import { FiPlus, FiSave, FiTrash2, FiX } from "react-icons/fi";

export default function AdminEducation() {
  const [items, setItems] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<Partial<Education> | null>(null);
  const [saving, setSaving] = useState(false);

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from("education")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setItems((data || []) as Education[]);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editItem?.institution?.trim()) return;
    setSaving(true);

    try {
      const data = {
        institution: editItem.institution?.trim() || "",
        degree: editItem.degree?.trim() || "",
        description: editItem.description?.trim() || "",
        start_date: editItem.start_date || "",
        end_date: editItem.end_date || null,
        display_order: editItem.display_order || 0,
      };

      if (editItem.id) {
        const { error } = await supabase
          .from("education")
          .update(data)
          .eq("id", editItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("education")
          .insert(data);
        if (error) throw error;
      }

      setEditItem(null);
      await loadItems();
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this education entry?")) return;
    try {
      const { error } = await supabase
        .from("education")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setItems(items.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Education</h1>
        <button
          onClick={() =>
            setEditItem({
              institution: "",
              degree: "",
              description: "",
              start_date: "",
              end_date: "",
              display_order: items.length,
            })
          }
          className="admin-btn flex items-center gap-2"
        >
          <FiPlus size={16} />
          Add
        </button>
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {editItem.id ? "Edit" : "Add"} Education
              </h2>
              <button
                onClick={() => setEditItem(null)}
                className="text-muted hover:text-foreground"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Institution *
                </label>
                <input
                  type="text"
                  value={editItem.institution || ""}
                  onChange={(e) =>
                    setEditItem({ ...editItem, institution: e.target.value })
                  }
                  placeholder="University name"
                  required
                  className="admin-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Degree</label>
                <input
                  type="text"
                  value={editItem.degree || ""}
                  onChange={(e) =>
                    setEditItem({ ...editItem, degree: e.target.value })
                  }
                  placeholder="e.g. B.Sc. Computer Science"
                  className="admin-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={editItem.description || ""}
                  onChange={(e) =>
                    setEditItem({ ...editItem, description: e.target.value })
                  }
                  rows={4}
                  placeholder="Activities, achievements, etc."
                  className="admin-input resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={editItem.start_date || ""}
                    onChange={(e) =>
                      setEditItem({ ...editItem, start_date: e.target.value })
                    }
                    placeholder="e.g. 2020"
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date
                  </label>
                  <input
                    type="text"
                    value={editItem.end_date || ""}
                    onChange={(e) =>
                      setEditItem({ ...editItem, end_date: e.target.value })
                    }
                    placeholder="e.g. 2024"
                    className="admin-input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={editItem.display_order || 0}
                  onChange={(e) =>
                    setEditItem({
                      ...editItem,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="admin-input w-24"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-btn flex items-center gap-2"
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <FiSave size={16} />
                  )}
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="admin-btn admin-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-muted">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 glass-card text-muted">
          <p>No education entries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="glass-card p-4 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <h3 className="font-semibold">{item.degree}</h3>
                <p className="text-sm text-primary-light">{item.institution}</p>
                <p className="text-xs text-muted mt-0.5">
                  {item.start_date} — {item.end_date || "Present"}
                </p>
                {item.description && (
                  <p className="text-sm text-muted mt-2 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => setEditItem(item)}
                  className="p-2 rounded-lg hover:bg-surface-hover text-muted hover:text-primary transition-all"
                >
                  <FiSave size={14} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-all"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
