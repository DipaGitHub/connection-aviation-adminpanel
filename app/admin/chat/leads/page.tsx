"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Loader2, 
  Search, 
  Trash2, 
  Eye, 
  User, 
  Mail, 
  Phone, 
  MessageSquare,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { API } from "@/lib/api";

interface ChatMessage {
  text: string;
  sender: "bot" | "user";
}

interface ChatLead {
  id: number;
  name: string;
  phone_number: string;
  email: string | null;
  selected_topic: string;
  chat_transcript: string | ChatMessage[];
  created_at: string;
}

export default function ChatLeadsPage() {
  const [leads, setLeads] = useState<ChatLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [topicFilter, setTopicFilter] = useState("all");
  const [activeLead, setActiveLead] = useState<ChatLead | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(API.chatbotLeads);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLeads(data);
    } catch {
      toast.error("Failed to load chat leads");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this lead?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API.chatbotLeads}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Lead deleted successfully");
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
    } catch {
      toast.error("Failed to delete lead");
    } finally {
      setDeletingId(null);
    }
  };

  // Extract unique topics for the filter dropdown
  const uniqueTopics = Array.from(new Set(leads.map((l) => l.selected_topic))).filter(Boolean);

  // Filter & search logic
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone_number.includes(searchQuery) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTopic = topicFilter === "all" || lead.selected_topic === topicFilter;
    
    return matchesSearch && matchesTopic;
  });

  const getTranscript = (lead: ChatLead): ChatMessage[] => {
    if (!lead.chat_transcript) return [];
    if (Array.isArray(lead.chat_transcript)) return lead.chat_transcript;
    try {
      return JSON.parse(lead.chat_transcript);
    } catch {
      return [];
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Chatbot Leads</h1>
          <p className="text-sm text-gray-500">View and manage sales leads captured through the website chatbot.</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search leads by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">All Topics</option>
          {uniqueTopics.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <Card className="border-gray-200 shadow-sm p-12 text-center text-gray-400">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30 text-gray-400" />
          <p className="text-base font-semibold">No chatbot leads found</p>
          <p className="text-xs text-gray-400 mt-1">Leads captured by the chatbot widget will appear here automatically.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="border-gray-200/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden bg-white">
              {/* Highlight bar for topic */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-slate-155 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {lead.selected_topic}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-2 flex items-center gap-1.5">
                      <User className="h-4.5 w-4.5 text-gray-400 shrink-0" />
                      {lead.name}
                    </h3>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setActiveLead(lead)}
                      className="text-blue-600 hover:bg-blue-50"
                      title="View Conversation"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(lead.id)}
                      disabled={deletingId === lead.id}
                      className="text-red-500 hover:bg-red-50"
                      title="Delete Lead"
                    >
                      {deletingId === lead.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                    <span className="font-mono text-xs">{lead.phone_number}</span>
                  </div>
                  {lead.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                      <a href={`mailto:${lead.email}`} className="hover:underline font-mono text-xs">
                        {lead.email}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-100">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {new Date(lead.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Chat Transcript Dialog Drawer */}
      <Dialog open={!!activeLead} onOpenChange={() => setActiveLead(null)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden bg-white border-border rounded-xl shadow-lg">
          <DialogHeader className="p-4 border-b border-border flex flex-row justify-between items-center bg-slate-50/50">
            <DialogTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <MessageSquare className="h-4 w-4 text-primary" />
              Chat Transcript - {activeLead?.name}
            </DialogTitle>
          </DialogHeader>

          {/* Transcript List Scroll */}
          <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-slate-50/30 flex flex-col">
            {activeLead && getTranscript(activeLead).length === 0 ? (
              <div className="my-auto text-center text-xs text-muted-foreground">
                No chat transcript was recorded.
              </div>
            ) : (
              activeLead &&
              getTranscript(activeLead).map((msg, index) => {
                const isBot = msg.sender === "bot";
                return (
                  <div
                    key={index}
                    className={`flex flex-col max-w-[80%] ${
                      isBot ? "self-start" : "self-end items-end"
                    }`}
                  >
                    <span className="text-[10px] text-muted-foreground mb-1">
                      {isBot ? "Assistant" : activeLead.name}
                    </span>
                    <div
                      className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${
                        isBot
                          ? "bg-white text-foreground rounded-tl-none border border-border"
                          : "bg-primary text-primary-foreground rounded-tr-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-border bg-slate-50/50 text-right flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setActiveLead(null)}>
              Close Window
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
