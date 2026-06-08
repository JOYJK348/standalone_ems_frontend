"use client";

import { useState } from "react";

import AcademicManagerLayout from "@/components/layout/AcademicManagerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, User, Bell, Lock, Globe, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");
    const [profileData, setProfileData] = useState({
        first_name: "Academic",
        last_name: "Manager",
        email: "academic@durkkas.com",
        phone: "+91 98765 43210",
    });

    const [notificationSettings, setNotificationSettings] = useState({
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true,
        announcement_alerts: true,
    });

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "security", label: "Security", icon: Lock },
        { id: "preferences", label: "Preferences", icon: Globe },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <AcademicManagerLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="mb-6">
                    <Link href="/ems/academic-manager/dashboard">
                        <Button variant="ghost" size="sm" className="mb-2">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                        Settings
                    </h1>
                    <p className="text-gray-600 mt-1">Manage your account and preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <Card className="border-0 shadow-lg h-fit">
                        <CardContent className="p-4">
                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeTab === tab.id
                                                ? 'bg-purple-100 text-purple-700 font-medium'
                                                : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <tab.icon className="h-5 w-5" />
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </CardContent>
                    </Card>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        {activeTab === "profile" && (
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
                                    <form className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="first_name">First Name</Label>
                                                <Input id="first_name" value={profileData.first_name}
                                                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })} />
                                            </div>
                                            <div>
                                                <Label htmlFor="last_name">Last Name</Label>
                                                <Input id="last_name" value={profileData.last_name}
                                                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" type="email" value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone</Label>
                                            <Input id="phone" value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} />
                                        </div>
                                        <Button className="bg-purple-600 hover:bg-purple-700">
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === "notifications" && (
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
                                    <div className="space-y-4">
                                        {Object.entries(notificationSettings).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Receive notifications via {key.split('_')[0]}
                                                    </p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={value}
                                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, [key]: e.target.checked })}
                                                        className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <Button className="mt-6 bg-purple-600 hover:bg-purple-700">
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Preferences
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === "security" && (
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>
                                    <form className="space-y-6">
                                        <div>
                                            <Label htmlFor="current_password">Current Password</Label>
                                            <Input id="current_password" type="password" />
                                        </div>
                                        <div>
                                            <Label htmlFor="new_password">New Password</Label>
                                            <Input id="new_password" type="password" />
                                        </div>
                                        <div>
                                            <Label htmlFor="confirm_password">Confirm New Password</Label>
                                            <Input id="confirm_password" type="password" />
                                        </div>
                                        <Button className="bg-purple-600 hover:bg-purple-700">
                                            <Lock className="h-4 w-4 mr-2" />
                                            Update Password
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === "preferences" && (
                            <Card className="border-0 shadow-lg">
                                <CardContent className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">System Preferences</h2>
                                    <div className="space-y-6">
                                        <div>
                                            <Label htmlFor="language">Language</Label>
                                            <select id="language" className="w-full h-10 px-3 rounded-md border border-gray-300">
                                                <option value="en">English</option>
                                                <option value="ta">Tamil</option>
                                                <option value="hi">Hindi</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label htmlFor="timezone">Timezone</Label>
                                            <select id="timezone" className="w-full h-10 px-3 rounded-md border border-gray-300">
                                                <option value="IST">India Standard Time (IST)</option>
                                                <option value="UTC">UTC</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label htmlFor="date_format">Date Format</Label>
                                            <select id="date_format" className="w-full h-10 px-3 rounded-md border border-gray-300">
                                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                            </select>
                                        </div>
                                        <Button className="bg-purple-600 hover:bg-purple-700">
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Preferences
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
            </AcademicManagerLayout>
        </div>
    );
}

