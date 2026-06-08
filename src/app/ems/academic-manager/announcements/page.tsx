"use client";

import { useState, useEffect } from "react";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, Plus, ArrowLeft, X, Bell } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

interface Announcement {
    id: number;
    title: string;
    message: string;
    created_at: string;
    priority: string;
}

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        message: "",
        priority: "NORMAL",
        target_audience: "ALL",
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const response = await api.get("/ems/announcements");
            if (response.data.success) {
                setAnnouncements(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching announcements:", error);
        }
    };

    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post("/ems/announcements", formData);
            if (response.data.success) {
                setShowCreateForm(false);
                fetchAnnouncements();
                setFormData({ title: "", message: "", priority: "NORMAL", target_audience: "ALL" });
            }
        } catch (error) {
            console.error("Error creating announcement:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link href="/ems/academic-manager/dashboard">
                            <Button variant="ghost" size="sm" className="mb-2">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                            Announcements
                        </h1>
                        <p className="text-gray-600 mt-1">Broadcast messages to students and tutors</p>
                    </div>
                    <Button onClick={() => setShowCreateForm(true)} className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        New Announcement
                    </Button>
                </div>

                <div className="space-y-4">
                    {announcements.map((announcement) => (
                        <Card key={announcement.id} className="border-0 shadow-lg">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${announcement.priority === 'HIGH' ? 'bg-red-100' : 'bg-purple-100'
                                        }`}>
                                        <Bell className={`h-6 w-6 ${announcement.priority === 'HIGH' ? 'text-red-600' : 'text-purple-600'}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{announcement.title}</h3>
                                        <p className="text-gray-600 mb-3">{announcement.message}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(announcement.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {showCreateForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowCreateForm(false)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
                            onClick={(e) => e.stopPropagation()}>
                            <div className="border-b px-6 py-4 flex items-center justify-between">
                                <h2 className="text-2xl font-bold">Create Announcement</h2>
                                <Button variant="ghost" size="icon" onClick={() => setShowCreateForm(false)}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-6">
                                <div>
                                    <Label htmlFor="title">Title *</Label>
                                    <Input id="title" required value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                                <div>
                                    <Label htmlFor="message">Message *</Label>
                                    <Textarea id="message" required rows={5} value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Priority</Label>
                                        <select className="w-full h-10 px-3 rounded-md border" value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                                            <option value="NORMAL">Normal</option>
                                            <option value="HIGH">High</option>
                                            <option value="URGENT">Urgent</option>
                                        </select>
                                    </div>
                                    <div>
                                        <Label>Target Audience</Label>
                                        <select className="w-full h-10 px-3 rounded-md border" value={formData.target_audience}
                                            onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}>
                                            <option value="ALL">All</option>
                                            <option value="STUDENTS">Students Only</option>
                                            <option value="TUTORS">Tutors Only</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreateForm(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                                        Publish
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            </AcademicManagerLayout>
        </div>
    );
}

