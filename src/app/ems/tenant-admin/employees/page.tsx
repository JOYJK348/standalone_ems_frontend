"use client";

import React, { useEffect, useState } from "react";
import {
    Users,
    Plus,
    Search,
    Loader2,
    Eye,
    Edit,
    Trash2,
    KeyRound,
    UserPlus,
    X,
    Mail,
    Phone,
    Building2,
    ShieldCheck,
    UserCheck,
    UserX,
    AlertCircle,
    Check,
    Eye as EyeIcon,
    EyeOff,
    Briefcase,
    Calendar,
    Hash,
    MapPin,
    Settings
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { platformService } from "@/services/platformService";
import { toast } from "sonner";

interface Role {
    id: number;
    name: string;
    display_name: string;
    level: number;
}

interface Branch {
    id: number;
    name: string;
}

interface Department {
    id: number;
    name: string;
}

interface Designation {
    id: number;
    title: string;
}

interface EmployeeData {
    id: number;
    employee_code: string;
    first_name: string;
    last_name?: string;
    full_name: string;
    email?: string;
    phone?: string;
    branch_id: number;
    department_id?: number;
    designation_id?: number;
    employment_type: string;
    date_of_joining: string;
    user_id?: number;
    is_active: boolean;
    branches?: { id: number; name: string };
    departments?: { id: number; name: string };
    designations?: { id: number; title: string };
}

interface UserData {
    id: number;
    email: string;
    display_name: string;
    is_active: boolean;
}

// ─── Add Staff Modal ──────────────────────────────────────────────────
function AddStaffModal({
    open,
    onClose,
    onSuccess,
    branches,
    departments,
    designations,
    roles
}: {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    branches: Branch[];
    departments: Department[];
    designations: Designation[];
    roles: Role[];
}) {
    const [step, setStep] = useState<'employee' | 'login'>('employee');
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        employee_code: '',
        branch_id: '',
        department_id: '',
        designation_id: '',
        date_of_joining: new Date().toISOString().split('T')[0],
        employment_type: 'FULL_TIME',
        password: '',
        confirm_password: '',
        role_id: ''
    });

    useEffect(() => {
        if (open) {
            platformService.getNextEmployeeCode().then((res: any) => {
                setForm(f => ({ ...f, employee_code: res?.code || '' }));
            }).catch(() => {});
            setStep('employee');
            setSaving(false);
            setShowPassword(false);
            setShowConfirm(false);
        }
    }, [open]);

    const reset = () => {
        setForm({
            first_name: '', last_name: '', email: '', phone: '',
            employee_code: '', branch_id: '', department_id: '',
            designation_id: '', date_of_joining: new Date().toISOString().split('T')[0],
            employment_type: 'FULL_TIME', password: '', confirm_password: '', role_id: ''
        });
        setStep('employee');
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const nextStep = () => {
        if (!form.first_name || !form.email || !form.employee_code || !form.branch_id) {
            toast.error('Please fill in all required fields (First Name, Email, Employee Code, Branch)');
            return;
        }
        setStep('login');
    };

    const handleSubmit = async () => {
        if (!form.password || form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (form.password !== form.confirm_password) {
            toast.error('Passwords do not match');
            return;
        }
        if (!form.role_id) {
            toast.error('Please select a role');
            return;
        }

        setSaving(true);
        try {
            const payload: any = {
                employee: {
                    first_name: form.first_name,
                    last_name: form.last_name || undefined,
                    email: form.email,
                    phone: form.phone || undefined,
                    employee_code: form.employee_code,
                    branch_id: Number(form.branch_id),
                    department_id: form.department_id ? Number(form.department_id) : undefined,
                    designation_id: form.designation_id ? Number(form.designation_id) : undefined,
                    date_of_joining: form.date_of_joining,
                    employment_type: form.employment_type
                },
                role_id: Number(form.role_id),
                password: form.password
            };
            await platformService.onboardEmployee(payload);
            toast.success('Staff onboarded successfully!');
            reset();
            onSuccess();
            onClose();
        } catch (err: any) {
            const serverMsg = err?.response?.data?.message || err?.response?.data?.error?.message || '';
            console.error('[AddStaff] Error:', err?.response?.data || err);
            toast.error(serverMsg || err?.message || 'Failed to onboard staff');
            if (err?.response?.status === 403 && serverMsg) {
                toast.error(`Server says: ${serverMsg}`, { duration: 8000 });
            }
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    const branchesList = Array.isArray(branches) ? branches : [];
    const deptsList = Array.isArray(departments) ? departments : [];
    const desigsList = Array.isArray(designations) ? designations : [];
    const rolesList = Array.isArray(roles) ? roles : [];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <UserPlus className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900">Add Staff</h3>
                            <p className="text-sm text-slate-500">
                                Step {step === 'employee' ? '1' : '2'} of 2 — {step === 'employee' ? 'Employee Information' : 'Login Credentials'}
                            </p>
                        </div>
                        <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                    {/* Step indicator */}
                    <div className="flex gap-2 mt-4">
                        <div className={`h-1.5 flex-1 rounded-full ${step === 'employee' ? 'bg-blue-600' : 'bg-blue-200'}`} />
                        <div className={`h-1.5 flex-1 rounded-full ${step === 'login' ? 'bg-blue-600' : 'bg-slate-200'}`} />
                    </div>
                </div>

                {step === 'employee' ? (
                    /* ─── Employee Info Step ─── */
                    <div className="p-6 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name *</label>
                                <input type="text" required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                                <input type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email *</label>
                                <input type="email" required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="staff@example.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                                <input type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employee Code *</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        value={form.employee_code} onChange={e => setForm(f => ({ ...f, employee_code: e.target.value }))} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employment Type *</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={form.employment_type} onChange={e => setForm(f => ({ ...f, employment_type: e.target.value }))}>
                                    <option value="FULL_TIME">Full Time</option>
                                    <option value="PART_TIME">Part Time</option>
                                    <option value="CONTRACT">Contract</option>
                                    <option value="INTERN">Intern</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Branch *</label>
                                <select required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={form.branch_id} onChange={e => setForm(f => ({ ...f, branch_id: e.target.value }))}>
                                    <option value="">Select Branch</option>
                                    {branchesList.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={form.department_id} onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}>
                                    <option value="">Select Department</option>
                                    {deptsList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                {deptsList.length === 0 && (
                                    <p className="text-[10px] text-amber-600 mt-1">No departments yet. Create in Settings → Departments</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Designation</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={form.designation_id} onChange={e => setForm(f => ({ ...f, designation_id: e.target.value }))}>
                                    <option value="">Select Designation</option>
                                    {desigsList.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                                </select>
                                {desigsList.length === 0 && (
                                    <p className="text-[10px] text-amber-600 mt-1">No designations yet. Create in Settings → Designations</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date of Joining</label>
                                <input type="date"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={form.date_of_joining} onChange={e => setForm(f => ({ ...f, date_of_joining: e.target.value }))} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button onClick={handleClose}
                                className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                                Cancel
                            </button>
                            <button onClick={nextStep}
                                className="px-6 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-200">
                                Next — Login Info
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ─── Login Info Step ─── */
                    <div className="p-6 space-y-5">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                            <p className="text-sm text-blue-800">
                                Login credentials for <strong>{form.first_name} {form.last_name}</strong>.
                                Email will be used as the login ID.
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Login Email</label>
                            <input type="email" required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password *</label>
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                        placeholder="Min. 6 characters" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password *</label>
                                <div className="relative">
                                    <input type={showConfirm ? 'text' : 'password'} required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        value={form.confirm_password} onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))} />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role *</label>
                            <select required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={form.role_id} onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}>
                                <option value="">Select Role</option>
                                {rolesList.filter(r => r.level < 5).map(r =>
                                    <option key={r.id} value={r.id}>{r.display_name || r.name}</option>
                                )}
                            </select>
                        </div>
                        <div className="flex justify-between gap-3 pt-4 border-t border-slate-100">
                            <button onClick={() => setStep('employee')}
                                className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                                Back
                            </button>
                            <button onClick={handleSubmit} disabled={saving}
                                className="px-6 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center gap-2">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                {saving ? 'Creating...' : 'Create Staff & Login'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Create Login Modal (for existing employees without user) ─────────
function CreateLoginModal({ open, employee, onClose, onSuccess, roles }: {
    open: boolean;
    employee: EmployeeData | null;
    onClose: () => void;
    onSuccess: () => void;
    roles: Role[];
}) {
    const [form, setForm] = useState({ email: '', password: '', confirm_password: '', role_id: '' });
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (open && employee) {
            setForm({ email: employee.email || '', password: '', confirm_password: '', role_id: '' });
        }
    }, [open, employee]);

    const handleSubmit = async () => {
        if (!form.password || form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (form.password !== form.confirm_password) {
            toast.error('Passwords do not match');
            return;
        }
        if (!form.role_id) {
            toast.error('Please select a role');
            return;
        }
        setSaving(true);
        try {
            const res = await platformService.createUser({
                email: form.email,
                password: form.password,
                role_id: Number(form.role_id)
            });
            const newUserId = res?.id || res?.user?.id;
            if (newUserId && employee) {
                await platformService.updateEmployee(String(employee.id), { user_id: newUserId });
            }
            toast.success(`Login created for ${employee?.full_name || employee?.first_name}`);
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to create login');
        } finally {
            setSaving(false);
        }
    };

    if (!open || !employee) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <KeyRound className="w-6 h-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900">Create Login</h3>
                            <p className="text-sm text-slate-500">For: {employee.full_name || employee.first_name}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email (Login ID)</label>
                        <input type="email" required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <input type={showPassword ? 'text' : 'password'} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                placeholder="Min. 6 characters" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
                        <input type="password" required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={form.confirm_password} onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role</label>
                        <select required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={form.role_id} onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}>
                            <option value="">Select Role</option>
                            {(Array.isArray(roles) ? roles : []).filter(r => r.level < 5).map(r =>
                                <option key={r.id} value={r.id}>{r.display_name || r.name}</option>
                            )}
                        </select>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={saving}
                        className="px-6 py-3 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-lg shadow-amber-200 disabled:opacity-50 flex items-center gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                        {saving ? 'Creating...' : 'Create Login'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Edit Employee Modal ──────────────────────────────────────────────
function EditEmployeeModal({ open, employee, onClose, onSuccess, branches, departments, designations }: {
    open: boolean;
    employee: EmployeeData | null;
    onClose: () => void;
    onSuccess: () => void;
    branches: Branch[];
    departments: Department[];
    designations: Designation[];
}) {
    const [form, setForm] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open && employee) {
            setForm({
                first_name: employee.first_name,
                last_name: employee.last_name || '',
                email: employee.email || '',
                phone: employee.phone || '',
                employee_code: employee.employee_code,
                branch_id: String(employee.branch_id),
                department_id: employee.department_id ? String(employee.department_id) : '',
                designation_id: employee.designation_id ? String(employee.designation_id) : '',
                employment_type: employee.employment_type,
                date_of_joining: employee.date_of_joining?.split('T')[0] || ''
            });
        }
    }, [open, employee]);

    const handleSubmit = async () => {
        if (!form.first_name || !form.employee_code || !form.branch_id) {
            toast.error('Please fill in required fields');
            return;
        }
        setSaving(true);
        try {
            await platformService.updateEmployee(String(employee!.id), {
                first_name: form.first_name,
                last_name: form.last_name || undefined,
                email: form.email || undefined,
                phone: form.phone || undefined,
                employee_code: form.employee_code,
                branch_id: Number(form.branch_id),
                department_id: form.department_id ? Number(form.department_id) : undefined,
                designation_id: form.designation_id ? Number(form.designation_id) : undefined,
                employment_type: form.employment_type,
                date_of_joining: form.date_of_joining || undefined
            });
            toast.success('Employee updated successfully!');
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to update employee');
        } finally {
            setSaving(false);
        }
    };

    if (!open || !employee) return null;

    const branchesList = Array.isArray(branches) ? branches : [];
    const deptsList = Array.isArray(departments) ? departments : [];
    const desigsList = Array.isArray(designations) ? designations : [];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Edit className="w-6 h-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900">Edit Employee</h3>
                            <p className="text-sm text-slate-500">{employee.full_name || employee.first_name}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                </div>
                <div className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name *</label>
                            <input type="text" required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={form.first_name || ''} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                            <input type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={form.last_name || ''} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                            <input type="email"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                            <input type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employee Code *</label>
                            <input type="text" required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={form.employee_code || ''} onChange={e => setForm(f => ({ ...f, employee_code: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employment Type *</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={form.employment_type || 'FULL_TIME'}
                                onChange={e => setForm(f => ({ ...f, employment_type: e.target.value }))}>
                                <option value="FULL_TIME">Full Time</option>
                                <option value="PART_TIME">Part Time</option>
                                <option value="CONTRACT">Contract</option>
                                <option value="INTERN">Intern</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Branch *</label>
                            <select required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={form.branch_id || ''}
                                onChange={e => setForm(f => ({ ...f, branch_id: e.target.value }))}>
                                <option value="">Select Branch</option>
                                {branchesList.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={form.department_id || ''}
                                onChange={e => setForm(f => ({ ...f, department_id: e.target.value }))}>
                                <option value="">Select Department</option>
                                {deptsList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            {deptsList.length === 0 && (
                                <p className="text-[10px] text-amber-600 mt-1">No departments yet. Create in Settings → Departments</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Designation</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={form.designation_id || ''}
                                onChange={e => setForm(f => ({ ...f, designation_id: e.target.value }))}>
                                <option value="">Select Designation</option>
                                {desigsList.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                            </select>
                            {desigsList.length === 0 && (
                                <p className="text-[10px] text-amber-600 mt-1">No designations yet. Create in Settings → Designations</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date of Joining</label>
                            <input type="date"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={form.date_of_joining || ''}
                                onChange={e => setForm(f => ({ ...f, date_of_joining: e.target.value }))} />
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={saving}
                        className="px-6 py-3 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-lg shadow-amber-200 disabled:opacity-50 flex items-center gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Reset Password Modal ─────────────────────────────────────────────
function ResetPasswordModal({ open, employee, onClose, onSuccess }: {
    open: boolean;
    employee: EmployeeData | null;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [form, setForm] = useState({ password: '', confirm_password: '' });
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (open) setForm({ password: '', confirm_password: '' });
    }, [open]);

    const handleSubmit = async () => {
        if (!form.password || form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (form.password !== form.confirm_password) {
            toast.error('Passwords do not match');
            return;
        }
        setSaving(true);
        try {
            await platformService.updateUser(String(employee!.user_id), { password: form.password });
            toast.success(`Password reset for ${employee?.full_name || employee?.first_name}`);
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to reset password');
        } finally {
            setSaving(false);
        }
    };

    if (!open || !employee) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                            <KeyRound className="w-6 h-6 text-rose-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900">Reset Password</h3>
                            <p className="text-sm text-slate-500">For: {employee.full_name || employee.first_name}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                        <div className="relative">
                            <input type={showPassword ? 'text' : 'password'} required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                placeholder="Min. 6 characters" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                        <input type="password" required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={form.confirm_password} onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))} />
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={saving}
                        className="px-6 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-lg shadow-rose-200 disabled:opacity-50 flex items-center gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                        {saving ? 'Resetting...' : 'Reset Password'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Delete Employee Modal ────────────────────────────────────────────
function DeleteEmployeeModal({ open, employee, onClose, onSuccess }: {
    open: boolean;
    employee: EmployeeData | null;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [reason, setReason] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) setReason('');
    }, [open]);

    const handleDelete = async () => {
        setSaving(true);
        try {
            await platformService.deleteEmployee(String(employee!.id), reason || undefined);
            toast.success(`${employee?.full_name || employee?.first_name} removed successfully`);
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to remove employee');
        } finally {
            setSaving(false);
        }
    };

    if (!open || !employee) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                            <Trash2 className="w-6 h-6 text-rose-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900">Remove Employee</h3>
                            <p className="text-sm text-slate-500">{employee.full_name || employee.first_name}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 mb-4">
                        <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
                        <p className="text-sm text-rose-800">
                            This will deactivate <strong>{employee.full_name || employee.first_name}</strong> ({employee.employee_code}).
                            Their user account will remain active, but they will no longer appear in active employees list.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reason (optional)</label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                            rows={3}
                            placeholder="e.g., Resigned, Contract ended, Terminated..."
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                        />
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                        Cancel
                    </button>
                    <button onClick={handleDelete} disabled={saving}
                        className="px-6 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-lg shadow-rose-200 disabled:opacity-50 flex items-center gap-2">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        {saving ? 'Removing...' : 'Remove Employee'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────
export default function WorkspaceEmployees() {
    const [employees, setEmployees] = useState<EmployeeData[]>([]);
    const [users, setUsers] = useState<UserData[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBranch, setFilterBranch] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCreateLoginModal, setShowCreateLoginModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showResetPwdModal, setShowResetPwdModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const [emps, usrs, brns, depts, desigs, rls] = await Promise.all([
                platformService.getEmployees(),
                platformService.getUsers().catch(() => []),
                platformService.getBranches(),
                platformService.getDepartments(),
                platformService.getDesignations(),
                platformService.getRoles()
            ]);
            setEmployees(Array.isArray(emps) ? emps : []);
            setUsers(Array.isArray(usrs) ? usrs : []);
            setBranches(Array.isArray(brns) ? brns : []);
            setDepartments(Array.isArray(depts) ? depts : []);
            setDesignations(Array.isArray(desigs) ? desigs : []);
            setRoles(Array.isArray(rls) ? rls : []);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const getUserForEmployee = (emp: EmployeeData): UserData | undefined => {
        if (!emp.user_id) return undefined;
        return (Array.isArray(users) ? users : []).find((u: UserData) => String(u.id) === String(emp.user_id));
    };

    const getLoginStatus = (emp: EmployeeData): { label: string; color: string; bg: string; dot: string } => {
        const user = getUserForEmployee(emp);
        if (!user) return { label: 'No Login', color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400' };
        if (user.is_active) return { label: 'Active', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' };
        return { label: 'Inactive', color: 'text-rose-700', bg: 'bg-rose-50', dot: 'bg-rose-500' };
    };

    const filteredEmployees = (Array.isArray(employees) ? employees : []).filter(e => {
        const q = searchTerm.toLowerCase();
        const matchesSearch = !q ||
            (e.first_name + ' ' + (e.last_name || '')).toLowerCase().includes(q) ||
            (e.email || '').toLowerCase().includes(q) ||
            e.employee_code.toLowerCase().includes(q) ||
            (e.phone || '').toLowerCase().includes(q);
        const matchesBranch = !filterBranch || String(e.branch_id) === filterBranch;
        const matchesDept = !filterDepartment || String(e.department_id) === filterDepartment;
        return matchesSearch && matchesBranch && matchesDept;
    });

    const stats = {
        total: (Array.isArray(employees) ? employees : []).length,
        withLogin: (Array.isArray(employees) ? employees : []).filter(e => e.user_id).length,
        noLogin: (Array.isArray(employees) ? employees : []).filter(e => !e.user_id).length,
        active: (Array.isArray(employees) ? employees : []).filter(e => {
            const user = getUserForEmployee(e);
            return user ? user.is_active : false;
        }).length
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 pb-12 px-4 md:px-0">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Employees</h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">Manage all staff, their profiles and login access</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 transition-all hover:shadow-xl"
                    >
                        <Plus className="w-5 h-5" />
                        Add Staff
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Staff</p>
                                <p className="text-2xl font-black text-slate-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <UserCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">With Login</p>
                                <p className="text-2xl font-black text-slate-900">{stats.withLogin}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                <UserX className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">No Login</p>
                                <p className="text-2xl font-black text-slate-900">{stats.noLogin}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Logins</p>
                                <p className="text-2xl font-black text-slate-900">{stats.active}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search + Filters */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input type="text"
                                placeholder="Search by name, email, code, or phone..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <select
                            className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all min-w-[160px]"
                            value={filterBranch} onChange={e => setFilterBranch(e.target.value)}>
                            <option value="">All Branches</option>
                            {(Array.isArray(branches) ? branches : []).map(b =>
                                <option key={b.id} value={b.id}>{b.name}</option>
                            )}
                        </select>
                        <select
                            className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all min-w-[160px]"
                            value={filterDepartment} onChange={e => setFilterDepartment(e.target.value)}>
                            <option value="">All Departments</option>
                            {(Array.isArray(departments) ? departments : []).map(d =>
                                <option key={d.id} value={d.id}>{d.name}</option>
                            )}
                        </select>
                    </div>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                        <p className="text-sm font-semibold text-slate-500">Loading employees...</p>
                    </div>
                ) : filteredEmployees.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <Users className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-2">No employees found</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            {searchTerm || filterBranch || filterDepartment
                                ? "Try adjusting your search or filters"
                                : "Get started by adding your first staff member"}
                        </p>
                        {!searchTerm && !filterBranch && !filterDepartment && (
                            <button onClick={() => setShowAddModal(true)}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all">
                                <Plus className="w-5 h-5" />
                                Add First Staff
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">Employee</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">Code</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">Contact</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">Branch</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">Department</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">Designation</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">Login Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredEmployees.map(emp => {
                                            const status = getLoginStatus(emp);
                                            const user = getUserForEmployee(emp);
                                            return (
                                                <tr key={emp.id} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold text-sm">
                                                                {(emp.first_name?.charAt(0) || '?').toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900">{emp.full_name || `${emp.first_name} ${emp.last_name || ''}`}</p>
                                                                {user && (
                                                                    <p className="text-xs text-slate-400 font-mono mt-0.5">User ID: {String(emp.user_id)}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                                            {emp.employee_code}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-0.5">
                                                            {emp.email && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                                    <span className="text-xs text-slate-600">{emp.email}</span>
                                                                </div>
                                                            )}
                                                            {emp.phone && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                                    <span className="text-xs text-slate-600">{emp.phone}</span>
                                                                </div>
                                                            )}
                                                            {!emp.email && !emp.phone && <span className="text-xs text-slate-400">---</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-medium text-slate-700">
                                                            {emp.branches?.name || '---'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-600">
                                                            {emp.departments?.name || '---'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-600">
                                                            {emp.designations?.title || '---'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${status.bg} ${status.color}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                                            {status.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {!emp.user_id ? (
                                                                <button
                                                                    onClick={() => { setSelectedEmployee(emp); setShowCreateLoginModal(true); }}
                                                                    className="p-2 hover:bg-amber-50 rounded-lg text-slate-500 hover:text-amber-600 transition-all"
                                                                    title="Create Login">
                                                                    <KeyRound className="w-4 h-4" />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => { setSelectedEmployee(emp); setShowResetPwdModal(true); }}
                                                                    className="p-2 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600 transition-all"
                                                                    title="Reset Password">
                                                                    <KeyRound className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => { setSelectedEmployee(emp); setShowEditModal(true); }}
                                                                className="p-2 hover:bg-amber-50 rounded-lg text-slate-500 hover:text-amber-600 transition-all"
                                                                title="Edit Employee">
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => { setSelectedEmployee(emp); setShowDeleteModal(true); }}
                                                                className="p-2 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600 transition-all"
                                                                title="Remove Employee">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-4">
                            {filteredEmployees.map(emp => {
                                const status = getLoginStatus(emp);
                                const user = getUserForEmployee(emp);
                                return (
                                    <div key={emp.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-lg transition-all">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center font-bold text-lg">
                                                    {(emp.first_name?.charAt(0) || '?').toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{emp.full_name || `${emp.first_name} ${emp.last_name || ''}`}</p>
                                                    <span className="font-mono text-xs text-slate-500">{emp.employee_code}</span>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold ${status.bg} ${status.color}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                                {status.label}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <div className="p-2.5 bg-slate-50 rounded-xl">
                                                <p className="text-[10px] text-slate-500 font-semibold mb-0.5">Branch</p>
                                                <p className="text-xs font-bold text-slate-900 truncate">{emp.branches?.name || '---'}</p>
                                            </div>
                                            <div className="p-2.5 bg-slate-50 rounded-xl">
                                                <p className="text-[10px] text-slate-500 font-semibold mb-0.5">Department</p>
                                                <p className="text-xs font-bold text-slate-900 truncate">{emp.departments?.name || '---'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                            {emp.email && (
                                                <div className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    <span className="truncate">{emp.email}</span>
                                                </div>
                                            )}
                                            {emp.phone && (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    <span>{emp.phone}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {!emp.user_id ? (
                                                <button
                                                    onClick={() => { setSelectedEmployee(emp); setShowCreateLoginModal(true); }}
                                                    className="flex-1 flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 py-2.5 rounded-xl font-semibold text-xs transition-all">
                                                    <KeyRound className="w-3.5 h-3.5" />
                                                    Create Login
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => { setSelectedEmployee(emp); setShowResetPwdModal(true); }}
                                                    className="flex-1 flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2.5 rounded-xl font-semibold text-xs transition-all">
                                                    <KeyRound className="w-3.5 h-3.5" />
                                                    Reset Pwd
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { setSelectedEmployee(emp); setShowEditModal(true); }}
                                                className="flex-1 flex items-center justify-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 py-2.5 rounded-xl font-semibold text-xs transition-all">
                                                <Edit className="w-3.5 h-3.5" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => { setSelectedEmployee(emp); setShowDeleteModal(true); }}
                                                className="flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2.5 rounded-xl font-semibold text-xs transition-all px-3">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            <AddStaffModal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={loadData}
                branches={branches}
                departments={departments}
                designations={designations}
                roles={roles}
            />
            <CreateLoginModal
                open={showCreateLoginModal}
                employee={selectedEmployee}
                onClose={() => { setShowCreateLoginModal(false); setSelectedEmployee(null); }}
                onSuccess={loadData}
                roles={roles}
            />
            <EditEmployeeModal
                open={showEditModal}
                employee={selectedEmployee}
                onClose={() => { setShowEditModal(false); setSelectedEmployee(null); }}
                onSuccess={loadData}
                branches={branches}
                departments={departments}
                designations={designations}
            />
            <ResetPasswordModal
                open={showResetPwdModal}
                employee={selectedEmployee}
                onClose={() => { setShowResetPwdModal(false); setSelectedEmployee(null); }}
                onSuccess={loadData}
            />
            <DeleteEmployeeModal
                open={showDeleteModal}
                employee={selectedEmployee}
                onClose={() => { setShowDeleteModal(false); setSelectedEmployee(null); }}
                onSuccess={loadData}
            />
        </DashboardLayout>
    );
}
