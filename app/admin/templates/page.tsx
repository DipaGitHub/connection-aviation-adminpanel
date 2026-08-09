"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit3, Trash2, Loader2, Mail, FileText } from "lucide-react";
import { toast } from "sonner";
import { API } from "@/lib/api";

interface EmailTemplate {
  id: number;
  subject: string;
  description: string;
}

const emptyForm = {
  subject: "",
  description: "",
};

const placeholders = [
  "{{customer_name}}",
  "{{enquiry_id}}",
  "{{email}}",
  "{{phone}}",
  "{{trip_type}}",
  "{{from}}",
  "{{to}}",
  "{{passengers}}",
  "{{date_of_journey}}",
  "{{time_of_journey}}",
  "{{custom_message}}",
  "{{current_date}}"
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch(API.templates);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTemplates(data);
    } catch {
      toast.error("Failed to load email templates");
    } finally {
      setLoading(false);
    }
  };

  const insertPlaceholder = (field: "subject" | "description", placeholder: string) => {
    const inputEl = document.getElementById(field) as HTMLInputElement | HTMLTextAreaElement | null;
    if (inputEl) {
      const start = inputEl.selectionStart || 0;
      const end = inputEl.selectionEnd || 0;
      const currentValue = form[field];
      const newValue = currentValue.substring(0, start) + placeholder + currentValue.substring(end);
      
      setForm((prev) => ({
        ...prev,
        [field]: newValue
      }));
      
      // Keep input focused and reset cursor position
      setTimeout(() => {
        inputEl.focus();
        const newCursorPos = start + placeholder.length;
        inputEl.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    } else {
      setForm((prev) => ({
        ...prev,
        [field]: prev[field] + placeholder
      }));
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (template: EmailTemplate) => {
    setEditingId(template.id);
    setForm({
      subject: template.subject,
      description: template.description,
    });
    setOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      toast.error("Subject and Template Body are required.");
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `${API.templates}/${editingId}` : API.templates;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      toast.success(editingId ? "Template updated successfully" : "Template created successfully");
      setOpen(false);
      fetchTemplates();
    } catch (err: any) {
      toast.error(err.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this template? This action cannot be undone.")) return;
    try {
      const res = await fetch(`${API.templates}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Template removed");
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast.error("Failed to delete template");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Email Templates</h1>
          <p className="text-sm text-gray-500">Manage templates for sending responses to enquiries.</p>
        </div>
        <Button onClick={openCreate} className="bg-primary hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" /> Add Template
        </Button>
      </div>

      {/* Placeholders Cheat Sheet */}
      <Card className="bg-slate-50 border border-slate-200">
        <CardContent className="p-4 sm:p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-slate-550" /> Supported Placeholders Cheatsheet
          </h3>
          <p className="text-xs text-slate-600 mb-3">
            Use these tags in your Subject or Template Body. They will be auto-replaced with enquiry info on send.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono">
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-primary font-bold">{"{{customer_name}}"}</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">First + Last Name</p>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-primary font-bold">{"{{enquiry_id}}"}</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Enquiry ID Code</p>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-primary font-bold">{"{{email}}"}</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Customer Email</p>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-primary font-bold">{"{{phone}}"}</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Customer Phone</p>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-primary font-bold">{"{{trip_type}}"}</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Oneway/Roundtrip (Jet)</p>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-primary font-bold">{"{{from}}"} / {"{{to}}"}</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Route endpoints (Heli)</p>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-primary font-bold">{"{{passengers}}"}</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Passenger Count</p>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <span className="text-primary font-bold">{"{{custom_message}}"}</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">Inlined message text</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : templates.length === 0 ? (
        <Card className="border-gray-200 shadow-sm p-12 text-center text-gray-400 bg-white">
          <Mail className="h-12 w-12 mx-auto mb-4 opacity-30 text-gray-400" />
          <p className="text-base font-semibold">No Email Templates Configured</p>
          <p className="text-xs text-gray-400 mt-1">Add templates to respond to customer inquiries faster.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="border-gray-200/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden bg-white">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Subject</span>
                    <h3 className="font-bold text-gray-900 truncate mt-0.5" title={template.subject}>
                      {template.subject}
                    </h3>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(template)} className="text-blue-600 hover:bg-blue-50">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)} className="text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">Template Body</span>
                  <div className="mt-1.5 p-3 rounded-md bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap line-clamp-4 h-24 overflow-hidden">
                    {template.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-white text-gray-900 rounded-xl shadow-lg border border-border">
          <form onSubmit={handleSave} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-gray-900">
                {editingId ? "Edit Email Template" : "Add Email Template"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 text-sm">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="subject">Subject *</Label>
                  <span className="text-[10px] text-muted-foreground">Click tag to insert at cursor</span>
                </div>
                <div className="flex flex-wrap gap-1 p-1.5 rounded border border-dashed border-slate-200 bg-slate-50/50 max-h-24 overflow-y-auto">
                  {placeholders.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => insertPlaceholder("subject", p)}
                      className="text-[10px] bg-white hover:bg-primary/5 text-primary border border-slate-250 px-2 py-0.5 rounded font-mono transition-colors font-medium"
                    >
                      {p.replace(/[{}]/g, "")}
                    </button>
                  ))}
                </div>
                <Input
                  id="subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Flight Charter Quotation for {{customer_name}}"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="description">Template Body *</Label>
                  <span className="text-[10px] text-muted-foreground">Click tag to insert at cursor</span>
                </div>
                <div className="flex flex-wrap gap-1 p-1.5 rounded border border-dashed border-slate-200 bg-slate-50/50 max-h-24 overflow-y-auto">
                  {placeholders.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => insertPlaceholder("description", p)}
                      className="text-[10px] bg-white hover:bg-primary/5 text-primary border border-slate-250 px-2 py-0.5 rounded font-mono transition-colors font-medium"
                    >
                      {p.replace(/[{}]/g, "")}
                    </button>
                  ))}
                </div>
                <Textarea
                  id="description"
                  rows={8}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Dear {{customer_name}},\n\nThank you for choosing Connection Aviation. Here is your inquiry details:\nInquiry ID: {{enquiry_id}}\n..."
                  required
                />
              </div>
            </div>

            <DialogFooter className="border-t border-border pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingId ? "Save Changes" : "Create Template"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
