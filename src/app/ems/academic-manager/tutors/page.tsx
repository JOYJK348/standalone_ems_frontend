"use client";

import { useState, useEffect } from "react";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Plus, Search, Mail, Phone, ArrowLeft, X, BookOpen, Users } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

interface Tutor {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    specialization: string;
    employee_code?: string;
    courses_assigned: number;
    status: string;
}

export default function TutorsPage() {
    const [tutors, setTutors] = useState<Tutor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        specialization: "",
        employee_code: "",
        password: "",
        gender: "Male",
        date_of_birth: "",
    });

    const [candidates, setCandidates] = useState<any[]>([]);
    const [selectedCandidate, setSelectedCandidate] = useState<string>("");

    useEffect(() => {
        fetchTutors();
    }, []);

    const fetchTutors = async () => {
        try {
            setLoading(true);
            const response = await api.get("/ems/tutors");
            if (response.data.success) {
                setTutors(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching tutors:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCandidates = async () => {
        try {
            const response = await api.get("/ems/tutors?mode=candidates");
            if (response.data.success) {
                setCandidates(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching candidates:", error);
        }
    };

    const handleOpenAddModal = () => {
        fetchCandidates();
        setShowAddForm(true);
    };

    const handleAddTutor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCandidate) return;

        try {
            const response = await api.post("/ems/tutors", { employee_id: parseInt(selectedCandidate) });
            if (response.data.success) {
                setShowAddForm(false);
                fetchTutors();
                setSelectedCandidate("");
            }
        } catch (error) {
            console.error("Error adding tutor:", error);
        }
    };

    const filteredTutors = tutors.filter((tutor) =>
        `${tutor.first_name} ${tutor.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                            Tutors (Academic Staff)
                        </h1>
                        <p className="text-gray-600 mt-1">Manage teaching staff and course assignments</p>
                    </div>
                    <Button onClick={handleOpenAddModal} className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Assign New Tutor
                    </Button>
                </div>

                <Card className="mb-6 border-0 shadow-md">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input type="search" placeholder="Search tutors..." className="pl-10"
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading staff...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTutors.length > 0 ? (
                            filteredTutors.map((tutor) => (
                                <Card key={tutor.id} className="border-0 shadow-lg hover:shadow-xl transition-all group">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 font-bold text-lg border-2 border-white shadow-sm group-hover:scale-110 transition-transform">
                                                {tutor.first_name.charAt(0)}{tutor.last_name.charAt(0)}
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${true ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {/* Status from Employee record usually implies active if enlisted */}
                                                ACTIVE
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-0.5">
                                            {tutor.first_name} {tutor.last_name}
                                        </h3>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{tutor.employee_code}</p>

                                        <div className="space-y-3 text-sm text-gray-600 mb-6 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3.5 w-3.5 text-purple-400" />
                                                <span className="truncate text-xs font-medium">{tutor.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3.5 w-3.5 text-purple-400" />
                                                <span className="text-xs font-medium">{tutor.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="h-3.5 w-3.5 text-purple-400" />
                                                <span className="text-xs font-medium">{tutor.courses_assigned || 0} courses assigned</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={`/ems/academic-manager/tutors/${tutor.id}/assign-courses`} className="flex-1">
                                                <Button size="sm" className="w-full bg-white border border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 font-bold shadow-sm">
                                                    <BookOpen className="h-3.5 w-3.5 mr-2" />
                                                    Assign Courses
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center">
                                <GraduationCap className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-gray-900">No tutors found</h3>
                                <p className="text-gray-500">Add staff via the button above.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showAddForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                        onClick={() => setShowAddForm(false)}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
                            onClick={(e) => e.stopPropagation()}>
                            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Assign Tutor Role</h2>
                                    <p className="text-purple-100 text-xs mt-1">Select an existing employee to promote</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)} className="text-white hover:bg-white/20 rounded-full">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleAddTutor} className="p-6">
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <Label htmlFor="candidate" className="text-sm font-semibold text-gray-700 mb-2 block">
                                            Select Employee
                                        </Label>
                                        <select
                                            id="candidate"
                                            className="w-full h-12 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                                            value={selectedCandidate}
                                            onChange={(e) => setSelectedCandidate(e.target.value)}
                                            required
                                        >
                                            <option value="">-- Choose an employee --</option>
                                            {candidates.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.first_name} {c.last_name} ({c.employee_code}) - {c.email}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            Only showing employees with linked user accounts
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="flex-1 font-bold border-gray-200">
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={!selectedCandidate} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-200">
                                        Confirm Assignment
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

