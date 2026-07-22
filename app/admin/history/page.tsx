"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { API, API_BASE_URL } from "@/lib/api";

const API_URL = API.history;

interface HistoryItem {
  id?: number;
  year: string;
  month: string;
  image: string;
  alt: string;
  headline: string;
  body: string;
  imageFile?: File | null;
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<HistoryItem | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      toast.error("Failed to load history items");
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditing({ year: "", month: "", image: "", alt: "", headline: "", body: "" });
    setOpen(true);
  };

  const openEdit = (item: HistoryItem) => {
    setEditing({ ...item });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!editing) return;

    const method = editing.id ? "PUT" : "POST";
    const url = editing.id ? `${API_URL}/${editing.id}` : API_URL;

    try {
      const formData = new FormData();
      formData.append("year", editing.year || "");
      formData.append("month", editing.month || "");
      formData.append("alt", editing.alt || "");
      formData.append("headline", editing.headline || "");
      formData.append("body", editing.body || "");
      
      if (editing.imageFile) {
        formData.append("image", editing.imageFile);
      } else if (editing.image) {
        formData.append("existing_image", editing.image);
      }

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) throw new Error();

      toast.success(editing.id ? "History item updated" : "History item added");
      setOpen(false);
      fetchItems();
    } catch (err) {
      toast.error("Failed to save history item");
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Are you sure you want to delete this history item?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("History item deleted");
      fetchItems();
    } catch (err) {
      toast.error("Delete failed");
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
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Our History"
        description="Manage the timeline history items shown on your website."
        action={
          <Button
            onClick={openNew}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" /> Add History
          </Button>
        }
      />

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-lg text-muted-foreground">
            No history items found. Click &quot;Add History&quot; to get started.
          </div>
        ) : (
          items.map((item) => (
            <Card
              key={item.id}
              className="hover:shadow-md transition-all border-border/50"
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-4 sm:gap-6">
                  {/* Left side: Image */}
                  <div className="w-24 h-24 sm:w-32 sm:h-24 shrink-0 bg-muted rounded-md flex items-center justify-center border overflow-hidden">
                    {item.image ? (
                      <img 
                        src={item.image.startsWith("http") ? item.image : `${API_BASE_URL}/${item.image}`}
                        alt={item.headline}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                    )}
                  </div>
                  
                  {/* Right side: Content */}
                  <div className="flex-1 min-w-0">
                    {/* Top: Year and Month */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                        {item.year}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                        {item.month}
                      </span>
                    </div>
                    
                    {/* Bottom: Headline and Body */}
                    <h3 className="font-semibold text-foreground text-base">
                      {item.headline}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                      {item.body}
                    </p>
                  </div>
                  
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => item.id && remove(item.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit History Item" : "New History Item"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input
                    value={editing.year}
                    onChange={(e) =>
                      setEditing({ ...editing, year: e.target.value })
                    }
                    placeholder="e.g., 2004"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Input
                    value={editing.month}
                    onChange={(e) =>
                      setEditing({ ...editing, month: e.target.value })
                    }
                    placeholder="e.g., December"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Headline</Label>
                <Input
                  value={editing.headline}
                  onChange={(e) =>
                    setEditing({ ...editing, headline: e.target.value })
                  }
                  placeholder="e.g., The Foundation of Elite Aviation Brokering"
                />
              </div>

              <div className="space-y-2">
                <Label>Image Upload</Label>
                <div className="flex flex-col gap-2">
                  {editing.image && !editing.imageFile && (
                    <div className="text-sm text-muted-foreground break-all bg-muted p-2 rounded border">
                      Current: {editing.image}
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setEditing({ ...editing, imageFile: e.target.files[0] });
                      }
                    }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  Upload an image file here to display it on the history timeline.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Image Alt Text (Optional)</Label>
                <Input
                  value={editing.alt}
                  onChange={(e) =>
                    setEditing({ ...editing, alt: e.target.value })
                  }
                  placeholder="e.g., Connection Aviation 2004"
                />
              </div>

              <div className="space-y-2">
                <Label>Body text</Label>
                <Textarea
                  rows={4}
                  value={editing.body}
                  onChange={(e) =>
                    setEditing({ ...editing, body: e.target.value })
                  }
                  placeholder="Detailed history content..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
            >
              <Save className="h-4 w-4 mr-2" /> Save Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
