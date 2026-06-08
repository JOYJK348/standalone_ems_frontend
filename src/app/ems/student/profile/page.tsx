"use client";

import { motion } from "framer-motion";
import { TopNavbar } from "@/components/ems/dashboard/top-navbar";
import { BottomNav } from "@/components/ems/dashboard/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    BookOpen,
    Award,
    TrendingUp,
    Edit,
    Save,
    ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: "Student Name",
        email: "student@durkkas.com",
        phone: "+91 98765 43210",
        address: "Chennai, Tamil Nadu, India",
        enrollmentDate: "Jan 15, 2024",
        studentId: "STU2024001",
    });

    const stats = [
        { label: "Courses Enrolled", value: "3", icon: BookOpen, color: "blue" },
        { label: "Assignments Done", value: "12", icon: Award, color: "green" },
        { label: "Overall Progress", value: "68%", icon: TrendingUp, color: "purple" },
    ];

    const handleSave = () => {
        setIsEditing(false);
        toast.success("Profile Updated", {
            description: "Your profile has been updated successfully",
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <TopNavbar />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="mb-4">
                    <Link href="/ems/student/dashboard">
                        <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">My Profile</h1>
                            <p className="text-gray-600">Manage your personal information</p>
                        </div>
                        {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Profile
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <Card className="border-0 shadow-xl">
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                                        <User className="h-16 w-16 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h2>
                                    <p className="text-gray-600 mb-1">{profile.email}</p>
                                    <p className="text-sm text-gray-500">ID: {profile.studentId}</p>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm">{profile.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm">{profile.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <MapPin className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm">{profile.address}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Calendar className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm">Enrolled: {profile.enrollmentDate}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-xl mt-6">
                            <CardHeader>
                                <CardTitle className="text-lg">Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {stats.map((stat, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                                                <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                                            </div>
                                            <span className="text-sm text-gray-700">{stat.label}</span>
                                        </div>
                                        <span className="font-bold text-gray-900">{stat.value}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2"
                    >
                        <Card className="border-0 shadow-xl">
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            disabled={!isEditing}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            disabled={!isEditing}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            disabled={!isEditing}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="studentId">Student ID</Label>
                                        <Input
                                            id="studentId"
                                            value={profile.studentId}
                                            disabled
                                            className="mt-1 bg-gray-50"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        value={profile.address}
                                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                        disabled={!isEditing}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                                    <Input
                                        id="enrollmentDate"
                                        value={profile.enrollmentDate}
                                        disabled
                                        className="mt-1 bg-gray-50"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-xl mt-6">
                            <CardHeader>
                                <CardTitle>Academic Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                        <span className="text-gray-700">Current Semester</span>
                                        <span className="font-semibold">Semester 1</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                        <span className="text-gray-700">Program</span>
                                        <span className="font-semibold">Full Stack Development</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                        <span className="text-gray-700">Batch</span>
                                        <span className="font-semibold">2024-A</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
