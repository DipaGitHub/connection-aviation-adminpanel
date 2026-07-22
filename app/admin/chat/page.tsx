"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import { API } from "@/lib/api";

interface ChatTopic {
  id: number;
  topic_name: string;
  initial_answer: string;
  follow_up_questions: string[] | string | null;
  is_active: number | boolean;
}

const emptyForm = {
  topic_name: "",
  initial_answer: "",
  follow_up_questions: [] as string[],
  is_active: true,
};

const normalizeFollowUps = (raw: ChatTopic["follow_up_questions"]): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function ChatTopicsManager() {
  const [topics, setTopics] = useState<ChatTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [followUpDraft, setFollowUpDraft] = useState("");

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      // Admin GET endpoint returns all topics (active + inactive).
      // If your backend's admin GET only exists implicitly via the same
      // /admin/topics route used for POST, add a matching GET handler there.
      const res = await fetch(API.chatbotTopics);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTopics(data);
    } catch {
      toast.error("Failed to load chat topics");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFollowUpDraft("");
    setOpen(true);
  };

  const openEdit = (topic: ChatTopic) => {
    setEditingId(topic.id);
    setForm({
      topic_name: topic.topic_name,
      initial_answer: topic.initial_answer,
      follow_up_questions: normalizeFollowUps(topic.follow_up_questions),
      is_active: !!topic.is_active,
    });
    setFollowUpDraft("");
    setOpen(true);
  };

  const addFollowUp = () => {
    const q = followUpDraft.trim();
    if (!q) return;
    setForm((prev) => ({ ...prev, follow_up_questions: [...prev.follow_up_questions, q] }));
    setFollowUpDraft("");
  };

  const removeFollowUp = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      follow_up_questions: prev.follow_up_questions.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async () => {
    if (!form.topic_name.trim() || !form.initial_answer.trim()) {
      toast.error("Topic name and initial answer are required.");
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? API.chatbotTopicById(editingId) : API.chatbotTopics;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      toast.success(editingId ? "Topic updated" : "Topic created");
      setOpen(false);
      fetchTopics();
    } catch (err: any) {
      toast.error(err.message || "Failed to save topic");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this topic? This cannot be undone.")) return;
    try {
      const res = await fetch(API.chatbotTopicById(id), { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Topic removed");
      setTopics((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast.error("Failed to delete topic");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Topic
        </Button>
      </div>

      <div className="space-y-3">
        {topics.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-lg text-muted-foreground">
            No chat topics configured yet. Add one to power the website chat widget.
          </div>
        ) : (
          topics.map((topic) => {
            const followUps = normalizeFollowUps(topic.follow_up_questions);
            return (
              <Card key={topic.id} className="border-border/50">
                <CardContent className="p-5 flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{topic.topic_name}</h3>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${topic.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                          }`}
                      >
                        {topic.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {topic.initial_answer}
                    </p>
                    {followUps.length > 0 && (
                      <p className="text-[11px] text-muted-foreground mt-2">
                        {followUps.length} follow-up question{followUps.length > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => openEdit(topic)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(topic.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Topic" : "Add Topic"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-medium mb-1 block">Topic Name *</label>
              <Input
                value={form.topic_name}
                onChange={(e) => setForm({ ...form, topic_name: e.target.value })}
                placeholder="e.g. Private Jet Charter"
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Initial Answer *</label>
              <Textarea
                rows={3}
                value={form.initial_answer}
                onChange={(e) => setForm({ ...form, initial_answer: e.target.value })}
                placeholder="The bot's first reply after the user picks this topic..."
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Follow-up Questions</label>
              <p className="text-[11px] text-muted-foreground mb-2">
                Asked one at a time, in order, before the bot requests contact details.
              </p>
              <div className="flex gap-2 mb-2">
                <Input
                  value={followUpDraft}
                  onChange={(e) => setFollowUpDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFollowUp())}
                  placeholder="e.g. What's your preferred travel date?"
                />
                <Button type="button" variant="outline" onClick={addFollowUp}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1.5">
                {form.follow_up_questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-muted rounded-md px-3 py-1.5 text-xs"
                  >
                    <span>{idx + 1}. {q}</span>
                    <button onClick={() => removeFollowUp(idx)} aria-label="Remove">
                      <XIcon className="h-3.5 w-3.5 text-muted-foreground hover:text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Active (visible in chat widget)</label>
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingId ? "Save Changes" : "Create Topic"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}