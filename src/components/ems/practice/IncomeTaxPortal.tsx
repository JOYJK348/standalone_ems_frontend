'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, FileText,
    Building2, Calculator, Loader2, Info, User, Home, PiggyBank, Receipt, ShieldCheck,
    Plus, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api';
import { usePracticeScenario } from '@/hooks/usePracticeScenario';
import { ScenarioCard } from './shared/ScenarioCard';
import { PortalHeader } from './shared/PortalHeader';
import { ErrorListPanel } from './shared/ErrorListPanel';
import { PDFPreview } from './shared/PDFPreview';
import type { TaxSlab } from '@/lib/practiceTypes';

interface ITFormData {
    // Personal
    pan: string;
    full_name: string;
    dob: string;
    assessment_year: string;
    // Salary
    salary_income: string;
    allowances: string;
    perquisites: string;
    // House Property
    rental_income: string;
    municipal_tax: string;
    home_loan_interest: string;
    // Other Income
    interest_income: string;
    other_income: string;
    // Deductions
    deduction_80c: string;
    deduction_80d: string;
    deduction_80e: string;
    deduction_80g: string;
    other_deductions: string;
    // Regime
    tax_regime: 'NEW' | 'OLD';
    // E-Verification
    e_verified: boolean;
    verification_method: 'AADHAAR' | 'OTP' | '';
    otp_value: string;
}

interface IncomeTaxPortalProps {
    allocationId: number;
    onSuccess: () => void;
}

const STEPS = [
    { id: 1, title: 'Personal', icon: User },
    { id: 2, title: 'Salary', icon: Building2 },
    { id: 3, title: 'House Property', icon: Home },
    { id: 4, title: 'Other Income', icon: Receipt },
    { id: 5, title: 'Deductions', icon: PiggyBank },
    { id: 6, title: 'Tax Computation', icon: Calculator },
    { id: 7, title: 'Review', icon: CheckCircle2 },
    { id: 8, title: 'E-Verify', icon: ShieldCheck }
];

const STORAGE_KEY = 'ems_it_draft';
const DIFFICULTY_ID = 'ems_it_seen_scenarios';

function getSeenIds(): number[] {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(sessionStorage.getItem(DIFFICULTY_ID) || '[]'); } catch { return []; }
}

function addSeenId(id: number) {
    const ids = getSeenIds();
    if (!ids.includes(id)) { ids.push(id); sessionStorage.setItem(DIFFICULTY_ID, JSON.stringify(ids)); }
}

function loadDraft(): Partial<ITFormData> | null {
    if (typeof window === 'undefined') return null;
    try { const s = sessionStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}

function saveDraft(data: Partial<ITFormData>) {
    if (typeof window === 'undefined') return;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { }
}

function clearDraft() {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEY);
}

function computeTaxNewRegime(taxableIncome: number): number {
    let tax = 0;
    if (taxableIncome > 300000) {
        const slab240k = Math.min(taxableIncome, 600000) - 300000;
        tax += Math.max(0, slab240k) * 0.05;
    }
    if (taxableIncome > 600000) {
        const slab33k = Math.min(taxableIncome, 900000) - 600000;
        tax += Math.max(0, slab33k) * 0.10;
    }
    if (taxableIncome > 900000) {
        const slab33k = Math.min(taxableIncome, 1200000) - 900000;
        tax += Math.max(0, slab33k) * 0.15;
    }
    if (taxableIncome > 1200000) {
        const slab33k = Math.min(taxableIncome, 1500000) - 1200000;
        tax += Math.max(0, slab33k) * 0.20;
    }
    if (taxableIncome > 1500000) {
        const slabAbove = taxableIncome - 1500000;
        tax += Math.max(0, slabAbove) * 0.30;
    }
    const cess = tax * 0.04;
    return tax + cess;
}

function computeTaxOldRegime(taxableIncome: number): number {
    let tax = 0;
    if (taxableIncome > 250000) {
        const slab250k = Math.min(taxableIncome, 500000) - 250000;
        tax += Math.max(0, slab250k) * 0.05;
    }
    if (taxableIncome > 500000) {
        const slab500k = Math.min(taxableIncome, 1000000) - 500000;
        tax += Math.max(0, slab500k) * 0.20;
    }
    if (taxableIncome > 1000000) {
        const slabAbove = taxableIncome - 1000000;
        tax += Math.max(0, slabAbove) * 0.30;
    }
    const cess = tax * 0.04;
    return tax + cess;
}

export function IncomeTaxPortal({ allocationId, onSuccess }: IncomeTaxPortalProps) {
    const [seenIds, setSeenIds] = useState<number[]>(() => getSeenIds());
    const { scenario, loading: scenarioLoading, currentHintIndex, showNextHint, error: scenarioError } = usePracticeScenario('INCOME_TAX', seenIds);
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [taxSlabs, setTaxSlabs] = useState<TaxSlab[]>([]);
    const [form16File, setForm16File] = useState<File | null>(null);
    const [form16Parsing, setForm16Parsing] = useState(false);
    const [form16Parsed, setForm16Parsed] = useState(false);
    const form16Ref = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<ITFormData>(() => {
        const draft = loadDraft();
        return {
            pan: draft?.pan || '',
            full_name: draft?.full_name || '',
            dob: draft?.dob || '',
            assessment_year: draft?.assessment_year || '2025-26',
            salary_income: draft?.salary_income || '',
            allowances: draft?.allowances || '',
            perquisites: draft?.perquisites || '',
            rental_income: draft?.rental_income || '',
            municipal_tax: draft?.municipal_tax || '',
            home_loan_interest: draft?.home_loan_interest || '',
            interest_income: draft?.interest_income || '',
            other_income: draft?.other_income || '',
            deduction_80c: draft?.deduction_80c || '',
            deduction_80d: draft?.deduction_80d || '',
            deduction_80e: draft?.deduction_80e || '',
            deduction_80g: draft?.deduction_80g || '',
            other_deductions: draft?.other_deductions || '',
            tax_regime: draft?.tax_regime || 'NEW',
            e_verified: draft?.e_verified || false,
            verification_method: draft?.verification_method || '',
            otp_value: draft?.otp_value || ''
        };
    });

    useEffect(() => {
        api.get('/ems/practice/data?type=tax-slabs').then(res => {
            setTaxSlabs(res.data?.data || []);
        }).catch(() => { });
    }, []);

    useEffect(() => {
        if (scenario) {
            addSeenId(scenario.id);
            setSeenIds(getSeenIds());
        }
    }, [scenario]);

    useEffect(() => {
        const timer = setTimeout(() => saveDraft(formData), 800);
        return () => clearTimeout(timer);
    }, [formData]);

    // Computed values (memoized)
    const grossSalary = useMemo(() => [
        parseFloat(formData.salary_income || '0'),
        parseFloat(formData.allowances || '0'),
        parseFloat(formData.perquisites || '0')
    ].reduce((a, b) => a + b, 0), [formData.salary_income, formData.allowances, formData.perquisites]);

    const houseIncome = useMemo(() => parseFloat(formData.rental_income || '0'), [formData.rental_income]);
    const municipalTax = useMemo(() => parseFloat(formData.municipal_tax || '0'), [formData.municipal_tax]);
    const homeLoanInt = useMemo(() => parseFloat(formData.home_loan_interest || '0'), [formData.home_loan_interest]);

    const incomeFromHouse = useMemo(() => {
        const nav = Math.max(houseIncome - municipalTax - (houseIncome * 0.30), 0);
        return nav - homeLoanInt;
    }, [houseIncome, municipalTax, homeLoanInt]);

    const otherIncome = useMemo(() => [
        parseFloat(formData.interest_income || '0'),
        parseFloat(formData.other_income || '0')
    ].reduce((a, b) => a + b, 0), [formData.interest_income, formData.other_income]);

    const totalDeductions = useMemo(() => [
        Math.min(parseFloat(formData.deduction_80c || '0'), 150000),
        Math.min(parseFloat(formData.deduction_80d || '0'), formData.tax_regime === 'NEW' ? 25000 : 50000),
        parseFloat(formData.deduction_80e || '0'),
        parseFloat(formData.deduction_80g || '0'),
        parseFloat(formData.other_deductions || '0')
    ].reduce((a, b) => a + b, 0), [formData.deduction_80c, formData.deduction_80d, formData.deduction_80e, formData.deduction_80g, formData.other_deductions, formData.tax_regime]);

    const grossTotalIncome = useMemo(() => grossSalary + incomeFromHouse + otherIncome, [grossSalary, incomeFromHouse, otherIncome]);
    const taxableIncome = useMemo(() => Math.max(grossTotalIncome - totalDeductions, 0), [grossTotalIncome, totalDeductions]);
    const taxPayable = useMemo(() => formData.tax_regime === 'NEW'
        ? computeTaxNewRegime(taxableIncome)
        : computeTaxOldRegime(taxableIncome), [formData.tax_regime, taxableIncome]);

    const validatePAN = (pan: string) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};
        switch (step) {
            case 1:
                if (!formData.pan) newErrors.pan = 'PAN is required';
                else if (!validatePAN(formData.pan)) newErrors.pan = 'Format: ABCDE1234F';
                if (!formData.full_name) newErrors.full_name = 'Required';
                if (!formData.dob) newErrors.dob = 'Required';
                break;
            case 2:
                if (!formData.salary_income || Number(formData.salary_income) < 0) newErrors.salary_income = 'Valid salary required';
                break;
            case 5:
                if (Number(formData.deduction_80c) > 150000) newErrors.deduction_80c = 'Max ₹1,50,000 u/s 80C';
                if (Number(formData.deduction_80d) > 50000) newErrors.deduction_80d = 'Max ₹50,000 u/s 80D';
                break;
            case 6:
                if (taxableIncome < 0) newErrors.taxable = 'Income cannot be negative';
                break;
            case 7:
                if (!formData.verification_method) newErrors.verification_method = 'Select verification method';
                if (formData.verification_method === 'OTP' && !formData.otp_value) newErrors.otp_value = 'Enter OTP';
                break;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const updateField = (field: keyof ITFormData, value: string | 'NEW' | 'OLD') => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field as string]) {
            setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
        } else {
            toast.error('Fix errors before proceeding');
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(8)) {
            toast.error('Fix all errors');
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/ems/practice/student/it/return', {
                allocationId,
                pan: formData.pan,
                full_name: formData.full_name,
                assessment_year: formData.assessment_year,
                tax_regime: formData.tax_regime,
                salary_income: parseFloat(formData.salary_income || '0'),
                allowances: parseFloat(formData.allowances || '0'),
                perquisites: parseFloat(formData.perquisites || '0'),
                gross_salary: grossSalary,
                rental_income: parseFloat(formData.rental_income || '0'),
                municipal_tax: parseFloat(formData.municipal_tax || '0'),
                home_loan_interest: parseFloat(formData.home_loan_interest || '0'),
                income_from_house_property: incomeFromHouse,
                interest_income: parseFloat(formData.interest_income || '0'),
                other_income: parseFloat(formData.other_income || '0'),
                deduction_80c: Math.min(parseFloat(formData.deduction_80c || '0'), 150000),
                deduction_80d: Math.min(parseFloat(formData.deduction_80d || '0'), 50000),
                deduction_80e: parseFloat(formData.deduction_80e || '0'),
                deduction_80g: parseFloat(formData.deduction_80g || '0'),
                other_deductions: parseFloat(formData.other_deductions || '0'),
                gross_total_income: grossTotalIncome,
                total_deductions: totalDeductions,
                taxable_income: taxableIncome,
                tax_payable: Math.round(taxPayable * 100) / 100
            });
            clearDraft();
            toast.success('ITR-1 submitted successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
            onSuccess();
        }
    };

    const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;
    const activeSlabs = useMemo(() =>
        taxSlabs.filter(s => s.regime === formData.tax_regime),
        [taxSlabs, formData.tax_regime]
    );

    const errorList = useMemo(() => {
        const list: { field: string; message: string; severity: 'error' | 'warning' }[] = [];
        for (const [key, msg] of Object.entries(errors)) {
            list.push({ field: key, message: msg, severity: 'error' });
        }
        if (formData.tax_regime === 'OLD' && totalDeductions === 0) {
            list.push({ field: 'Deductions', message: 'Old Regime selected but no deductions claimed. Consider New Regime.', severity: 'warning' });
        }
        return list;
    }, [errors, formData.tax_regime, totalDeductions]);

    if (scenarioLoading) {
        return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
    }

    if (!scenario) {
        return <Card className="border-2 border-amber-200 bg-amber-50"><CardContent className="p-8 text-center"><Info className="h-12 w-12 text-amber-500 mx-auto mb-4" /><p className="text-lg font-bold text-amber-800">No scenarios available</p><p className="text-sm text-amber-600">{scenarioError || 'Check back later for new practice scenarios.'}</p></CardContent></Card>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <PortalHeader
                title="ITR-1 (SAHAJ)"
                subtitle="Income Tax Return for individuals having salary income"
                color="blue"
                badge="📋 INCOME TAX PRACTICE"
                attemptInfo={{ used: 0, limit: 5 }}
            />

            <ScenarioCard scenario={scenario} currentHintIndex={currentHintIndex} onShowNextHint={showNextHint} />

            {/* Progress */}
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold">Step {currentStep} of {STEPS.length}</p>
                        <Badge className="bg-white/20 text-white">{Math.round(progress)}% Complete</Badge>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                        <motion.div className="bg-white h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between mt-3 overflow-x-auto">
                        {STEPS.map((s) => {
                            const Icon = s.icon;
                            const isDone = currentStep > s.id;
                            const isCur = currentStep === s.id;
                            return (
                                <div key={s.id} className="flex flex-col items-center min-w-[50px]">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold
                                        ${isDone ? 'bg-white text-blue-700' : isCur ? 'bg-white/30 text-white ring-2 ring-white' : 'bg-white/10 text-white/60'}`}>
                                        {isDone ? <CheckCircle2 className="h-5 w-5" /> : s.id}
                                    </div>
                                    <p className={`text-[10px] mt-1 font-bold ${isCur ? 'text-white' : 'text-white/60'}`}>{s.title}</p>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <AnimatePresence mode="wait">
                <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <Card className="border-0 shadow-xl">
                        <CardHeader className="bg-gray-50 border-b">
                            <CardTitle className="flex items-center gap-3 text-lg">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    {(() => { const Icon = STEPS[currentStep - 1].icon; return <Icon className="h-5 w-5 text-blue-600" />; })()}
                                </div>
                                {STEPS[currentStep - 1].title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Step 1: Personal */}
                            {currentStep === 1 && (
                                <div className="space-y-5">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm font-bold text-blue-900">Personal Information</p>
                                        <p className="text-xs text-blue-700">Enter PAN, name, DOB and assessment year as per ITR-1 Sahaj.</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">PAN *</Label>
                                            <Input placeholder="ABCDE1234F" value={formData.pan} onChange={(e) => updateField('pan', e.target.value.toUpperCase())} className={`font-mono tracking-wider ${errors.pan ? 'border-red-500' : ''}`} maxLength={10} />
                                            {errors.pan && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.pan}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Assessment Year</Label>
                                            <Input value={formData.assessment_year} onChange={(e) => updateField('assessment_year', e.target.value)} className="font-mono" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Full Name *</Label>
                                            <Input placeholder="As per PAN card" value={formData.full_name} onChange={(e) => updateField('full_name', e.target.value)} className={errors.full_name ? 'border-red-500' : ''} />
                                            {errors.full_name && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.full_name}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Date of Birth *</Label>
                                            <Input type="date" value={formData.dob} onChange={(e) => updateField('dob', e.target.value)} className={errors.dob ? 'border-red-500' : ''} />
                                            {errors.dob && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.dob}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Salary */}
                            {currentStep === 2 && (
                                <div className="space-y-5">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <p className="text-sm font-bold text-green-900">Income from Salary (Schedule S)</p>
                                        <p className="text-xs text-green-700">Enter your salary, allowances, and perquisites. All figures in ₹.</p>
                                    </div>

                                    {/* Form 16 Upload */}
                                    <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-8 w-8 text-blue-500" />
                                                    <div>
                                                        <p className="text-sm font-bold text-blue-900">Upload Form 16</p>
                                                        <p className="text-xs text-blue-700">Upload your Form 16 PDF to auto-fill salary details</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <input
                                                        ref={form16Ref}
                                                        type="file"
                                                        accept=".pdf"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            setForm16File(file);
                                                            setForm16Parsing(true);
                                                            setTimeout(() => {
                                                                const baseSalary = Math.floor(Math.random() * 400000) + 500000;
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    salary_income: String(baseSalary),
                                                                    allowances: String(Math.floor(baseSalary * 0.15)),
                                                                    perquisites: String(Math.floor(Math.random() * 50000))
                                                                }));
                                                                setForm16Parsing(false);
                                                                setForm16Parsed(true);
                                                                toast.success('Form 16 parsed successfully! Salary fields auto-filled.');
                                                            }, 2000);
                                                        }}
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => form16Ref.current?.click()}
                                                        disabled={form16Parsing}
                                                        className="text-xs"
                                                    >
                                                        {form16Parsing ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />Parsing...</> : form16Parsed ? 'Re-upload' : 'Upload PDF'}
                                                    </Button>
                                                </div>
                                            </div>
                                            {form16Parsed && (
                                                <div className="mt-3 p-2 bg-green-100 rounded-lg text-xs text-green-800 flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Form 16 processed — {form16File?.name || 'document.pdf'}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Salary / Wages *</Label>
                                            <Input type="number" min="0" step="0.01" placeholder="600000" value={formData.salary_income} onChange={(e) => updateField('salary_income', e.target.value)} className={errors.salary_income ? 'border-red-500' : ''} />
                                            {errors.salary_income && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.salary_income}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Allowances</Label>
                                            <Input type="number" min="0" step="0.01" placeholder="50000" value={formData.allowances} onChange={(e) => updateField('allowances', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Perquisites</Label>
                                            <Input type="number" min="0" step="0.01" placeholder="0" value={formData.perquisites} onChange={(e) => updateField('perquisites', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 border rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold">Gross Salary</span>
                                            <span className="text-xl font-bold text-blue-700">₹{grossSalary.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: House Property */}
                            {currentStep === 3 && (
                                <div className="space-y-5">
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <p className="text-sm font-bold text-amber-900">Income from House Property (Schedule HP)</p>
                                        <p className="text-xs text-amber-700">Enter rental income, municipal taxes paid, and home loan interest.</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Rental Income (₹)</Label>
                                            <Input type="number" min="0" step="0.01" placeholder="120000" value={formData.rental_income} onChange={(e) => updateField('rental_income', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Municipal Tax Paid (₹)</Label>
                                            <Input type="number" min="0" step="0.01" placeholder="12000" value={formData.municipal_tax} onChange={(e) => updateField('municipal_tax', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Home Loan Interest (₹)</Label>
                                            <Input type="number" min="0" step="0.01" placeholder="180000" value={formData.home_loan_interest} onChange={(e) => updateField('home_loan_interest', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 border rounded-xl p-4">
                                        <h4 className="text-sm font-bold mb-3">Computation</h4>
                                        <div className="space-y-1.5 text-sm">
                                            <div className="flex justify-between"><span>Gross Annual Value (Rent)</span><span>₹{houseIncome.toLocaleString('en-IN')}</span></div>
                                            <div className="flex justify-between"><span>(-) Municipal Tax</span><span>₹{municipalTax.toLocaleString('en-IN')}</span></div>
                                            <div className="flex justify-between"><span>(-) 30% Standard Deduction</span><span>₹{(houseIncome * 0.30).toLocaleString('en-IN')}</span></div>
                                            <div className="flex justify-between"><span>(-) Home Loan Interest</span><span>₹{homeLoanInt.toLocaleString('en-IN')}</span></div>
                                            <div className="border-t pt-1.5 flex justify-between font-bold">
                                                <span>Income from House Property</span>
                                                <span className={incomeFromHouse < 0 ? 'text-red-600' : 'text-green-700'}>
                                                    ₹{incomeFromHouse.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Other Income */}
                            {currentStep === 4 && (
                                <div className="space-y-5">
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <p className="text-sm font-bold text-purple-900">Income from Other Sources</p>
                                        <p className="text-xs text-purple-700">Interest income from savings, FD, or any other income.</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Interest Income (₹)</Label>
                                            <Input type="number" min="0" step="0.01" placeholder="25000" value={formData.interest_income} onChange={(e) => updateField('interest_income', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Other Income (₹)</Label>
                                            <Input type="number" min="0" step="0.01" placeholder="0" value={formData.other_income} onChange={(e) => updateField('other_income', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="bg-purple-50 border rounded-lg p-3">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-sm">Total Other Income</span>
                                            <span className="font-bold text-lg">₹{otherIncome.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Deductions */}
                            {currentStep === 5 && (
                                <div className="space-y-5">
                                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                                        <p className="text-sm font-bold text-pink-900">Deductions (Chapter VI-A)</p>
                                        <p className="text-xs text-pink-700">Enter your eligible deductions. 80C max ₹1.5L, 80D max ₹50K.</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">80C (PPF/ELSS/LIC) — Max ₹1.5L</Label>
                                            <Input type="number" min="0" max="150000" step="0.01" placeholder="50000" value={formData.deduction_80c} onChange={(e) => updateField('deduction_80c', e.target.value)} className={errors.deduction_80c ? 'border-red-500' : ''} />
                                            {errors.deduction_80c && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.deduction_80c}</p>}
                                            <p className="text-xs text-gray-400">Effective: ₹{Math.min(parseFloat(formData.deduction_80c || '0'), 150000).toLocaleString('en-IN')}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">80D (Health Insurance) — Max ₹50K</Label>
                                            <Input type="number" min="0" max="50000" step="0.01" placeholder="25000" value={formData.deduction_80d} onChange={(e) => updateField('deduction_80d', e.target.value)} className={errors.deduction_80d ? 'border-red-500' : ''} />
                                            {errors.deduction_80d && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.deduction_80d}</p>}
                                            <p className="text-xs text-gray-400">Effective: ₹{Math.min(parseFloat(formData.deduction_80d || '0'), 50000).toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">80E (Education Loan)</Label>
                                            <Input type="number" min="0" step="0.01" placeholder="0" value={formData.deduction_80e} onChange={(e) => updateField('deduction_80e', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">80G (Donations)</Label>
                                            <Input type="number" min="0" step="0.01" placeholder="0" value={formData.deduction_80g} onChange={(e) => updateField('deduction_80g', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Other Deductions</Label>
                                            <Input type="number" min="0" step="0.01" placeholder="0" value={formData.other_deductions} onChange={(e) => updateField('other_deductions', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="bg-pink-50 border rounded-lg p-3">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-sm">Total Deductions</span>
                                            <span className="font-bold text-lg text-pink-700">₹{totalDeductions.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 6: Tax Computation */}
                            {currentStep === 6 && (
                                <div className="space-y-5">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                                        <Calculator className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="text-sm font-bold text-green-900">Tax Computation</p>
                                            <p className="text-xs text-green-700">Summary of all income and deductions. Choose your tax regime.</p>
                                        </div>
                                    </div>

                                    {/* Regime Toggle */}
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => updateField('tax_regime', 'NEW')}
                                            className={`flex-1 px-4 py-3 rounded-xl border-2 text-center text-sm font-bold transition-all
                                                ${formData.tax_regime === 'NEW' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-500'}`}
                                        >
                                            🆕 New Regime (Default)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateField('tax_regime', 'OLD')}
                                            className={`flex-1 px-4 py-3 rounded-xl border-2 text-center text-sm font-bold transition-all
                                                ${formData.tax_regime === 'OLD' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-500'}`}
                                        >
                                            📜 Old Regime
                                        </button>
                                    </div>

                                    {/* Tax Slabs */}
                                    {activeSlabs.length > 0 && (
                                        <Card className="border-2">
                                            <CardHeader className="bg-gray-50 pb-2">
                                                <CardTitle className="text-sm font-bold">
                                                    {formData.tax_regime} Regime — Tax Slabs (FY {activeSlabs[0]?.fy_year || '2024-25'})
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-3">
                                                <div className="space-y-1 text-xs">
                                                    {activeSlabs.map((slab, i) => (
                                                        <div key={i} className="flex justify-between py-1 border-b last:border-0">
                                                            <span>₹{slab.min_income.toLocaleString('en-IN')} {slab.max_income >= 999999999 ? '& above' : `- ₹${slab.max_income.toLocaleString('en-IN')}`}</span>
                                                            <span className="font-bold">{slab.rate}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Income Summary */}
                                    <div className="bg-gray-50 border-2 rounded-xl p-6">
                                        <h4 className="font-bold mb-4">Computation of Total Income</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span>Income from Salary</span><span className="font-bold">₹{grossSalary.toLocaleString('en-IN')}</span></div>
                                            <div className="flex justify-between"><span>Income from House Property</span><span className="font-bold">₹{incomeFromHouse.toLocaleString('en-IN')}</span></div>
                                            <div className="flex justify-between"><span>Income from Other Sources</span><span className="font-bold">₹{otherIncome.toLocaleString('en-IN')}</span></div>
                                            <div className="border-t pt-2 flex justify-between font-bold">
                                                <span>Gross Total Income</span>
                                                <span className="text-lg">₹{grossTotalIncome.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between text-green-700">
                                                <span>(-) Total Deductions</span>
                                                <span className="font-bold">₹{totalDeductions.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="border-t-2 border-blue-300 pt-2 flex justify-between font-bold text-lg">
                                                <span>Taxable Income</span>
                                                <span className="text-blue-700">₹{taxableIncome.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between text-2xl font-bold pt-2">
                                                <span>Tax Payable (incl. 4% cess)</span>
                                                <span className="text-red-700">₹{Math.round(taxPayable).toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 7: E-Verify */}
                            {currentStep === 7 && (
                                <div className="space-y-5">
                                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center gap-3">
                                        <ShieldCheck className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="text-sm font-bold text-indigo-900">E-Verification</p>
                                            <p className="text-xs text-indigo-700">Verify your return before submission. Choose method.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => updateField('verification_method', 'AADHAAR')}
                                            className={`p-6 rounded-xl border-2 text-center transition-all ${formData.verification_method === 'AADHAAR' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
                                            <p className="font-bold text-sm">Aadhaar OTP</p>
                                            <p className="text-xs text-gray-500 mt-1">Verify via Aadhaar-linked mobile</p>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => updateField('verification_method', 'OTP')}
                                            className={`p-6 rounded-xl border-2 text-center transition-all ${formData.verification_method === 'OTP' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
                                            <p className="font-bold text-sm">Net Banking OTP</p>
                                            <p className="text-xs text-gray-500 mt-1">Verify via bank-registered mobile</p>
                                        </button>
                                    </div>

                                    {formData.verification_method && (
                                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 space-y-4">
                                            <div className="flex items-center gap-2 text-sm text-indigo-900">
                                                <ShieldCheck className="h-4 w-4" />
                                                <span className="font-bold">OTP sent to registered mobile ******{(Math.floor(Math.random() * 9000) + 1000).toString()}</span>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold">Enter OTP *</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="6-digit OTP"
                                                        value={formData.otp_value}
                                                        onChange={(e) => updateField('otp_value', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                        className={`font-mono tracking-widest text-lg max-w-[200px] ${errors.otp_value ? 'border-red-500' : ''}`}
                                                        maxLength={6}
                                                    />
                                                    <Button variant="outline" size="sm" className="text-xs">Resend OTP</Button>
                                                </div>
                                                {errors.otp_value && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.otp_value}</p>}
                                                <p className="text-xs text-gray-400">Enter the 6-digit OTP sent to your registered mobile number</p>
                                            </div>
                                        </div>
                                    )}

                                    {formData.verification_method === '' && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                                            <Info className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                                            <p className="text-sm text-amber-800 font-bold">Select a verification method to continue</p>
                                            <p className="text-xs text-amber-600">This simulates the e-verification step in actual ITR filing</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 8: Review */}
                            {currentStep === 8 && (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                        <div>
                                            <p className="font-bold text-green-800">Review ITR-1 (Sahaj)</p>
                                            <p className="text-sm text-green-700">Verify all information before e-filing.</p>
                                        </div>
                                    </div>

                                    {errorList.length > 0 && <ErrorListPanel errors={errorList} />}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            {
                                                title: 'Personal',
                                                data: { PAN: formData.pan, Name: formData.full_name, 'AY': formData.assessment_year }
                                            },
                                            {
                                                title: 'Salary',
                                                data: { 'Gross Salary': `₹${grossSalary.toLocaleString('en-IN')}`, 'Regime': formData.tax_regime }
                                            },
                                            {
                                                title: 'House Property',
                                                data: { 'Rent': `₹${houseIncome.toLocaleString('en-IN')}`, 'Net Income': `₹${incomeFromHouse.toLocaleString('en-IN')}` }
                                            },
                                            {
                                                title: 'Other Income',
                                                data: { 'Total': `₹${otherIncome.toLocaleString('en-IN')}` }
                                            },
                                            {
                                                title: 'Deductions',
                                                data: { '80C': `₹${Math.min(parseFloat(formData.deduction_80c || '0'), 150000).toLocaleString('en-IN')}`, 'Total': `₹${totalDeductions.toLocaleString('en-IN')}` }
                                            },
                                            {
                                                title: 'Tax Payable',
                                                data: { 'Gross Income': `₹${grossTotalIncome.toLocaleString('en-IN')}`, 'Taxable': `₹${taxableIncome.toLocaleString('en-IN')}`, 'Tax': `₹${Math.round(taxPayable).toLocaleString('en-IN')}` }
                                            }
                                        ].map((section, i) => (
                                            <Card key={i} className="border-2">
                                                <CardHeader className="bg-gray-50 pb-2 flex flex-row items-center justify-between">
                                                    <CardTitle className="text-sm font-bold">{section.title}</CardTitle>
                                                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(i + 1)} className="text-xs">Edit</Button>
                                                </CardHeader>
                                                <CardContent className="pt-3">
                                                    <div className="space-y-1 text-sm">
                                                        {Object.entries(section.data).map(([key, val]) => (
                                                            <div key={key} className="flex justify-between">
                                                                <span className="text-gray-500">{key}</span>
                                                                <span className="font-bold">{val}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>

            <PDFPreview title="ITR-1 (SAHAJ) — Income Tax Return" filename={`ITR-1_${formData.pan || 'draft'}`}>
                <h2>Personal Information</h2>
                <div className="row"><span className="label">PAN:</span><span className="value">{formData.pan || '-'}</span></div>
                <div className="row"><span className="label">Name:</span><span className="value">{formData.full_name || '-'}</span></div>
                <div className="row"><span className="label">Assessment Year:</span><span className="value">{formData.assessment_year}</span></div>
                <div className="row"><span className="label">Regime:</span><span className="value">{formData.tax_regime}</span></div>

                <h2>Income Details</h2>
                <h3>Salary</h3>
                <div className="row"><span className="label">Gross Salary:</span><span className="value">₹{grossSalary.toLocaleString('en-IN')}</span></div>
                <h3>House Property</h3>
                <div className="row"><span className="label">Income from House Property:</span><span className="value">₹{incomeFromHouse.toLocaleString('en-IN')}</span></div>
                <h3>Other Sources</h3>
                <div className="row"><span className="label">Other Income:</span><span className="value">₹{otherIncome.toLocaleString('en-IN')}</span></div>

                <h2>Deductions (Chapter VI-A)</h2>
                <div className="row"><span className="label">80C:</span><span className="value">₹{Math.min(parseFloat(formData.deduction_80c || '0'), 150000).toLocaleString('en-IN')}</span></div>
                <div className="row"><span className="label">80D:</span><span className="value">₹{Math.min(parseFloat(formData.deduction_80d || '0'), 50000).toLocaleString('en-IN')}</span></div>
                <div className="row"><span className="label">Total Deductions:</span><span className="value">₹{totalDeductions.toLocaleString('en-IN')}</span></div>

                <h2>Tax Computation</h2>
                <div className="row"><span className="label">Gross Total Income:</span><span className="value">₹{grossTotalIncome.toLocaleString('en-IN')}</span></div>
                <div className="row"><span className="label">(-) Deductions:</span><span className="value">₹{totalDeductions.toLocaleString('en-IN')}</span></div>
                <div className="row"><span className="label">Taxable Income:</span><span className="value">₹{taxableIncome.toLocaleString('en-IN')}</span></div>
                <div className="row" style={{ borderTop: '2px solid #000', paddingTop: '8px', marginTop: '8px' }}><span className="label" style={{ fontWeight: 'bold' }}>Tax Payable (incl. 4% cess):</span><span className="value" style={{ fontWeight: 'bold', color: '#d00' }}>₹{Math.round(taxPayable).toLocaleString('en-IN')}</span></div>

                {formData.e_verified && <div className="badge" style={{ marginTop: '20px' }}>✓ E-Verified via {formData.verification_method}</div>}
            </PDFPreview>

            <div className="flex justify-between gap-4">
                <Button variant="outline" onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))} disabled={currentStep === 1} className="px-8">
                    <ArrowLeft className="h-4 w-4 mr-2" />Previous
                </Button>
                {currentStep < STEPS.length ? (
                    <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 px-8">
                        Next<ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 px-8">
                        {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : <><CheckCircle2 className="h-4 w-4 mr-2" />E-File ITR-1</>}
                    </Button>
                )}
            </div>
        </div>
    );
}
