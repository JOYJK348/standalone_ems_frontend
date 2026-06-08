"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Laptop,
    BookOpen,
    Calendar,
    ArrowRight,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    Copy,
    User,
    Users,
    Shield,
    Server
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import api from "@/lib/api";
import Cookie from "js-cookie";

// Single demo credential for unified student dashboard
const demoCredential = {
    email: "student@durkkas.com",
    password: "durkkas123",
    name: "Durkkas Student"
};

export default function StudentLoginPage() {
    const router = useRouter();
    const { setUser } = useAuthStore();
    const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        password: "",
        otp: "",
    });

    const handleLogin = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setIsLoading(true);

        try {
            // For Demo purposes, if it matches our demo credential
            if (formData.email.toLowerCase() === demoCredential.email.toLowerCase() &&
                formData.password === demoCredential.password) {
                // Simulate successful login
                const mockUser = {
                    id: "demo-student-id",
                    email: demoCredential.email,
                    display_name: demoCredential.name,
                    role: { name: "STUDENT", level: 0 },
                    company_id: "durkkas-foundation",
                };

                setUser(mockUser as any);
                Cookie.set("user_display_name", demoCredential.name);
                Cookie.set("user_role", "STUDENT");

                toast.success("Welcome back!", {
                    description: `Signed in as ${demoCredential.name}`
                });

                router.push("/ems/student/dashboard");
                return;
            }

            // Actual API Login
            const response = await api.post('/auth/login', {
                email: formData.email,
                password: formData.password
            });

            const { user, tokens } = response.data.data;
            const roles = user.roles || [];
            const primaryRole = roles.find((r: any) => r.name === "STUDENT") || roles[0] || { name: "GUEST", level: 0 };

            const displayName = `${user.firstName} ${user.lastName}` || user.display_name || "Student";
            const cookieOptions = { expires: 1, path: '/', sameSite: 'Lax' as const };

            // Set user in store
            setUser({
                id: user.id.toString(),
                email: user.email,
                display_name: displayName,
                role: {
                    name: primaryRole.name,
                    level: primaryRole.level
                },
                company_id: primaryRole.company_id?.toString()
            });

            // Set Essential Cookies
            Cookie.set("access_token", tokens.accessToken, cookieOptions);
            Cookie.set("user_display_name", displayName, cookieOptions);
            Cookie.set("user_role", primaryRole.name, cookieOptions);
            if (primaryRole.company_id) {
                Cookie.set("x-company-id", primaryRole.company_id.toString(), cookieOptions);
            }

            toast.success("Login Successful");
            router.push("/ems/student/dashboard");
        } catch (error: any) {
            toast.error("Login Failed", {
                description: error.response?.data?.message || "Invalid credentials"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoClick = () => {
        setFormData({
            ...formData,
            email: demoCredential.email,
            password: demoCredential.password,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#f1f5f9] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-blue-500/5 rounded-full blur-[80px]"
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 30, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-[100px]"
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, -40, 0],
                        y: [0, -20, 0],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>

            <div className="w-full max-w-5xl relative z-10">
                {/* Branding */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <Server className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            DURKKAS EMS
                        </h1>
                    </div>
                    <p className="text-muted-foreground font-medium tracking-wide uppercase text-xs">
                        Student Portal • Learning Sanctuary
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Login Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="premium-glass rounded-3xl p-8 border border-white/50 shadow-2xl backdrop-blur-xl"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">Student Login</h2>
                        <p className="text-muted-foreground text-sm mb-8">Ready to resume your learning journey?</p>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="flex gap-2 p-1 bg-gray-100/50 rounded-xl mb-6">
                                <button
                                    type="button"
                                    onClick={() => setLoginMethod("password")}
                                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold transition-all ${loginMethod === "password" ? "bg-white shadow-sm text-primary" : "text-gray-500"
                                        }`}
                                >Password</button>
                                <button
                                    type="button"
                                    onClick={() => setLoginMethod("otp")}
                                    className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold transition-all ${loginMethod === "otp" ? "bg-white shadow-sm text-primary" : "text-gray-500"
                                        }`}
                                >OTP Access</button>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Identify Yourself</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        type="email"
                                        placeholder="student@durkkas.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="pl-10 h-12 bg-white/50 border-gray-200 focus:bg-white transition-all rounded-xl"
                                    />
                                </div>
                            </div>

                            {loginMethod === "password" ? (
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Secret Key</label>
                                        <button type="button" className="text-[10px] font-bold text-primary hover:underline">Forgot?</button>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="pl-10 pr-10 h-12 bg-white/50 border-gray-200 focus:bg-white transition-all rounded-xl"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Verification Code</label>
                                    <Input
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        maxLength={6}
                                        className="h-12 text-center text-xl tracking-[0.5em] font-bold bg-white/50 border-gray-200 rounded-xl"
                                    />
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 text-sm font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-xl group"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Enter Student Dashboard
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </motion.div>

                    {/* Guidelines / Demo Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col gap-6"
                    >
                        <div className="premium-glass rounded-3xl p-8 border border-white/50 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full translate-x-16 -translate-y-16" />

                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Demo Access
                            </h3>

                            <div className="space-y-3 relative z-10">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    onClick={handleDemoClick}
                                    className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md cursor-pointer transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-sm">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Demo Student</p>
                                            <p className="text-xs font-bold text-gray-700">{demoCredential.email}</p>
                                            <p className="text-[10px] text-gray-500 mt-1">Password: {demoCredential.password}</p>
                                        </div>
                                        <Copy className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="text-primary w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-primary">Need technical help?</p>
                                <p className="text-[10px] text-primary/60">Contact your foundation admin or tutor.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
