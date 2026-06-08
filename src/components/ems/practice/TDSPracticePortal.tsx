'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, FileText,
    Building2, Calculator, Loader2, Info, Shield, Landmark,
    Plus, Trash2, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api';
import { usePracticeScenario } from '@/hooks/usePracticeScenario';
import { ScenarioCard } from './shared/ScenarioCard';
import { PortalHeader } from './shared/PortalHeader';
import { ErrorListPanel } from './shared/ErrorListPanel';
import type { TdsSection } from '@/lib/practiceTypes';
import type { DeducteeEntry } from '@/lib/practiceTypes';
import { createEmptyDeductee } from '@/lib/practiceTypes';

interface TDSFormData {
    deductor_tan: string;
    deductor_name: string;
    deductor_pan: string;
    deductees: DeducteeEntry[];
    tds_deposited: string;
    deposit_date: string;
    challan_serial: string;
    bsr_code: string;
    challan_date: string;
    challan_amount: string;
}

interface TDSPracticePortalProps {
    allocationId: number;
    onSuccess: () => void;
}

const STEPS = [
    { id: 1, title: 'Deductor (A)', icon: Building2 },
    { id: 2, title: 'Deductees (B)', icon: Users },
    { id: 3, title: 'TDS Computation (C)', icon: Calculator },
    { id: 4, title: 'Challan (D)', icon: Landmark },
    { id: 5, title: 'Review (E)', icon: CheckCircle2 }
];

const STORAGE_KEY = 'ems_tds_draft';
const DIFFICULTY_ID = 'ems_tds_seen_scenarios';

function getSeenIds(): number[] {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(sessionStorage.getItem(DIFFICULTY_ID) || '[]'); } catch { return []; }
}

function addSeenId(id: number) {
    const ids = getSeenIds();
    if (!ids.includes(id)) { ids.push(id); sessionStorage.setItem(DIFFICULTY_ID, JSON.stringify(ids)); }
}

function loadDraft(): Partial<TDSFormData> | null {
    if (typeof window === 'undefined') return null;
    try { const s = sessionStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}

function saveDraft(data: Partial<TDSFormData>) {
    if (typeof window === 'undefined') return;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { }
}

function clearDraft() {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEY);
}

export function TDSPracticePortal({ allocationId, onSuccess }: TDSPracticePortalProps) {
    const [seenIds, setSeenIds] = useState<number[]>(() => getSeenIds());
    const { scenario, loading: scenarioLoading, currentHintIndex, showNextHint, error: scenarioError } = usePracticeScenario('TDS', seenIds);
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [sections, setSections] = useState<TdsSection[]>([]);

    const [formData, setFormData] = useState<TDSFormData>(() => {
        const draft = loadDraft();
        return {
            deductor_tan: draft?.deductor_tan || '',
            deductor_name: draft?.deductor_name || '',
            deductor_pan: draft?.deductor_pan || '',
            deductees: draft?.deductees?.length ? draft.deductees : [createEmptyDeductee()],
            tds_deposited: draft?.tds_deposited || '0',
            deposit_date: draft?.deposit_date || '',
            challan_serial: draft?.challan_serial || '',
            bsr_code: draft?.bsr_code || '',
            challan_date: draft?.challan_date || '',
            challan_amount: draft?.challan_amount || '0'
        };
    });

    useEffect(() => {
        api.get('/ems/practice/data?type=tds-sections').then(res => {
            setSections(res.data?.data || []);
        }).catch(() => { });
    }, []);

    useEffect(() => {
        if (scenario) { addSeenId(scenario.id); setSeenIds(getSeenIds()); }
    }, [scenario]);

    useEffect(() => {
        const timer = setTimeout(() => saveDraft(formData), 800);
        return () => clearTimeout(timer);
    }, [formData]);

    const totalPaymentAmount = useMemo(() =>
        formData.deductees.reduce((sum, d) => sum + parseFloat(d.payment_amount || '0'), 0),
        [formData.deductees]
    );

    const totalTdsDeducted = useMemo(() =>
        formData.deductees.reduce((sum, d) => sum + parseFloat(d.tds_deducted || '0'), 0),
        [formData.deductees]
    );

    const selectedSection = (code: string) => sections.find(s => s.section_code === code);

    const validateTAN = (tan: string) => /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/.test(tan);
    const validatePAN = (pan: string) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
        }
    };

    const updateDeductee = (id: string, field: string, value: string) => {
        setFormData(prev => {
            const deductees = prev.deductees.map(d => {
                if (d.id !== id) return d;
                const next = { ...d, [field]: value };

                if (field === 'section_code') {
                    const sec = sections.find(s => s.section_code === value);
                    if (sec) next.tds_rate = String(sec.tds_rate);
                }

                if (field === 'payment_amount' || field === 'tds_rate') {
                    const amount = parseFloat(field === 'payment_amount' ? value : d.payment_amount || '0');
                    const rate = parseFloat(field === 'tds_rate' ? value : d.tds_rate || '0');
                    if (amount > 0 && rate > 0) {
                        next.tds_deducted = ((amount * rate) / 100).toFixed(2);
                    }
                }

                if (field === 'tds_deducted') {
                    next.tds_deposited = value;
                }

                return next;
            });
            return { ...prev, deductees };
        });
    };

    const addDeductee = () => {
        setFormData(prev => ({ ...prev, deductees: [...prev.deductees, createEmptyDeductee()] }));
    };

    const removeDeductee = (id: string) => {
        setFormData(prev => {
            const filtered = prev.deductees.filter(d => d.id !== id);
            return { ...prev, deductees: filtered.length ? filtered : [createEmptyDeductee()] };
        });
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};
        switch (step) {
            case 1:
                if (!formData.deductor_tan) newErrors.deductor_tan = 'TAN is required';
                else if (!validateTAN(formData.deductor_tan)) newErrors.deductor_tan = 'Format: ABCD12345E';
                if (!formData.deductor_name) newErrors.deductor_name = 'Required';
                if (formData.deductor_pan && !validatePAN(formData.deductor_pan)) newErrors.deductor_pan = 'Format: ABCDE1234F';
                break;
            case 2:
                if (formData.deductees.every(d => !d.deductee_name)) newErrors.deductees = 'At least one deductee required';
                for (const d of formData.deductees) {
                    if (!d.deductee_name) continue;
                    if (!d.deductee_pan) newErrors[`pan_${d.id}`] = `PAN required for ${d.deductee_name}`;
                    else if (!validatePAN(d.deductee_pan)) newErrors[`pan_${d.id}`] = 'Format: ABCDE1234F';
                    if (!d.section_code) newErrors[`sec_${d.id}`] = `Section required for ${d.deductee_name}`;
                    if (!d.payment_amount || Number(d.payment_amount) <= 0) newErrors[`amt_${d.id}`] = `Valid amount required for ${d.deductee_name}`;
                }
                break;
            case 3:
                if (!formData.tds_deposited || Number(formData.tds_deposited) <= 0) newErrors.tds_deposited = 'Total TDS deposited required';
                if (!formData.deposit_date) newErrors.deposit_date = 'Required';
                const totalExpected = formData.deductees.reduce((s, d) => s + parseFloat(d.tds_deducted || '0'), 0);
                if (Math.abs(Number(formData.tds_deposited) - totalExpected) > 1 && totalExpected > 0) {
                    newErrors.tds_deposited = `Expected total: ₹${totalExpected.toFixed(2)}`;
                }
                break;
            case 4:
                if (!formData.challan_serial) newErrors.challan_serial = 'Required';
                if (!formData.bsr_code) newErrors.bsr_code = 'Required';
                else if (!/^\d{7}$/.test(formData.bsr_code)) newErrors.bsr_code = '7 digits required';
                if (!formData.challan_date) newErrors.challan_date = 'Required';
                if (!formData.challan_amount || Number(formData.challan_amount) <= 0) newErrors.challan_amount = 'Required';
                if (Math.abs(Number(formData.challan_amount) - Number(formData.tds_deposited)) > 1) {
                    newErrors.challan_amount = 'Must match TDS deposited';
                }
                break;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
        } else {
            toast.error('Fix errors before proceeding');
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(4)) { toast.error('Fix all errors'); return; }
        setSubmitting(true);
        try {
            await api.post('/ems/practice/student/tds/entry', {
                allocationId,
                deductor_tan: formData.deductor_tan,
                deductor_name: formData.deductor_name,
                deductor_pan: formData.deductor_pan,
                deductees: formData.deductees.map(d => ({
                    deductee_name: d.deductee_name,
                    deductee_pan: d.deductee_pan,
                    section_code: d.section_code,
                    payment_amount: parseFloat(d.payment_amount || '0'),
                    tds_rate: parseFloat(d.tds_rate || '0'),
                    tds_deducted: parseFloat(d.tds_deducted || '0')
                })),
                total_payment: totalPaymentAmount,
                total_tds: totalTdsDeducted,
                tds_deposited: parseFloat(formData.tds_deposited),
                deposit_date: formData.deposit_date,
                challan_serial: formData.challan_serial,
                bsr_code: formData.bsr_code,
                challan_date: formData.challan_date,
                challan_amount: parseFloat(formData.challan_amount)
            });
            clearDraft();
            toast.success('Form 26Q submitted successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
            onSuccess();
        }
    };

    const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

    const errorList = useMemo(() => {
        const list: { field: string; message: string; severity: 'error' | 'warning' }[] = [];
        for (const [key, msg] of Object.entries(errors)) {
            if (!key.startsWith('pan_') && !key.startsWith('sec_') && !key.startsWith('amt_')) {
                list.push({ field: key, message: msg, severity: 'error' });
            }
        }
        const totalExpected = formData.deductees.reduce((s, d) => s + parseFloat(d.tds_deducted || '0'), 0);
        if (Math.abs(Number(formData.tds_deposited) - totalExpected) > 1 && totalExpected > 0) {
            list.push({ field: 'TDS Deposit', message: `Deposited (₹${formData.tds_deposited}) ≠ Total deducted (₹${totalExpected.toFixed(2)})`, severity: 'warning' });
        }
        return list;
    }, [errors, formData.tds_deposited, formData.deductees]);

    if (scenarioLoading) {
        return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-orange-600" /></div>;
    }

    if (!scenario) {
        return <Card className="border-2 border-amber-200 bg-amber-50"><CardContent className="p-8 text-center"><Info className="h-12 w-12 text-amber-500 mx-auto mb-4" /><p className="text-lg font-bold text-amber-800">No scenarios available</p><p className="text-sm text-amber-600">{scenarioError || 'Check back later for new practice scenarios.'}</p></CardContent></Card>;
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <PortalHeader
                title="Form 26Q — TDS Statement"
                subtitle="Statement of TDS on all payments other than salary"
                color="orange"
                badge="📋 TRACES PRACTICE"
                attemptInfo={{ used: 0, limit: 5 }}
            />

            <ScenarioCard scenario={scenario} currentHintIndex={currentHintIndex} onShowNextHint={showNextHint} />

            {errorList.length > 0 && currentStep < 5 && (
                <ErrorListPanel errors={errorList} />
            )}

            <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Section {STEPS[currentStep - 1].title.split('(')[1]?.replace(')', '') || ''}</p>
                            <p className="text-lg font-bold">{currentStep === 1 ? 'Deductor' : currentStep === 2 ? 'Deductees' : currentStep === 3 ? 'TDS Computation' : currentStep === 4 ? 'Challan' : 'Review'}</p>
                        </div>
                        <Badge className="bg-white/20 text-white">{Math.round(progress)}%</Badge>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                        <motion.div className="bg-white h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between mt-3">
                        {STEPS.map((s, i) => (
                            <div key={s.id} className="flex flex-col items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentStep > s.id ? 'bg-white text-orange-700' : currentStep === s.id ? 'bg-white/30 text-white ring-2 ring-white' : 'bg-white/10 text-white/60'}`}>
                                    {currentStep > s.id ? <CheckCircle2 className="h-5 w-5" /> : s.id}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <AnimatePresence mode="wait">
                <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <Card className="border-0 shadow-xl">
                        <CardHeader className="bg-gray-50 border-b">
                            <CardTitle className="flex items-center gap-3 text-lg">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    {(() => { const Icon = STEPS[currentStep - 1].icon; return <Icon className="h-5 w-5 text-orange-600" />; })()}
                                </div>
                                {currentStep === 1 ? 'Deductor Details' : currentStep === 2 ? 'Deductees' : currentStep === 3 ? 'TDS Computation' : currentStep === 4 ? 'Challan Details' : 'Review & Submit'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Step 1: Deductor */}
                            {currentStep === 1 && (
                                <div className="space-y-5">
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                        <p className="text-sm font-bold text-orange-900">Deductor Information</p>
                                        <p className="text-xs text-orange-700">Enter your organization's TAN, name and PAN (if applicable). 💡 TAN: 4 letters + 5 digits + 1 letter.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">TAN * (Tax Deduction Account No.)</Label>
                                        <div className="flex gap-2 items-center">
                                            <Input placeholder="e.g., ABCD12345E" value={formData.deductor_tan} onChange={(e) => updateField('deductor_tan', e.target.value.toUpperCase())} className={`font-mono tracking-wider flex-1 ${errors.deductor_tan ? 'border-red-500' : ''}`} maxLength={10} />
                                            <Button variant="outline" size="sm" onClick={() => updateField('deductor_tan', 'CHEF12345A')} className="text-xs shrink-0">Sample</Button>
                                        </div>
                                        {errors.deductor_tan && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.deductor_tan}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Deductor Name *</Label>
                                        <Input placeholder="e.g., ABC Corporation Ltd" value={formData.deductor_name} onChange={(e) => updateField('deductor_name', e.target.value)} className={errors.deductor_name ? 'border-red-500' : ''} />
                                        {errors.deductor_name && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.deductor_name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">PAN (Optional)</Label>
                                        <Input placeholder="e.g., ABCDE1234F" value={formData.deductor_pan} onChange={(e) => updateField('deductor_pan', e.target.value.toUpperCase())} className={`font-mono ${errors.deductor_pan ? 'border-red-500' : ''}`} maxLength={10} />
                                        {errors.deductor_pan && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.deductor_pan}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Deductees */}
                            {currentStep === 2 && (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm font-bold text-blue-900">Deductee Details</p>
                                        <p className="text-xs text-blue-700">Add all deductees. Each row = one person/entity. Select TDS section for auto-rate.</p>
                                    </div>

                                    <div className="overflow-x-auto border rounded-xl">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-600">
                                                <tr>
                                                    <th className="p-2 text-left">#</th>
                                                    <th className="p-2 text-left">Name *</th>
                                                    <th className="p-2 text-left">PAN *</th>
                                                    <th className="p-2 text-left">Section</th>
                                                    <th className="p-2 text-right">Amount</th>
                                                    <th className="p-2 text-right">Rate %</th>
                                                    <th className="p-2 text-right">TDS</th>
                                                    <th className="p-2"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {formData.deductees.map((d, idx) => {
                                                    const sec = selectedSection(d.section_code);
                                                    return (
                                                        <tr key={d.id} className="hover:bg-gray-50">
                                                            <td className="p-1.5 text-center text-gray-400 text-xs">{idx + 1}</td>
                                                            <td className="p-1.5">
                                                                <Input value={d.deductee_name} onChange={(e) => updateDeductee(d.id, 'deductee_name', e.target.value)} className="h-8 text-xs w-32" placeholder="Name" />
                                                            </td>
                                                            <td className="p-1.5">
                                                                <Input value={d.deductee_pan} onChange={(e) => updateDeductee(d.id, 'deductee_pan', e.target.value.toUpperCase())} className="h-8 text-xs font-mono w-28" placeholder="PAN" maxLength={10} />
                                                                {errors[`pan_${d.id}`] && <p className="text-[10px] text-red-600 mt-0.5">{errors[`pan_${d.id}`]}</p>}
                                                            </td>
                                                            <td className="p-1.5">
                                                                <select value={d.section_code} onChange={(e) => updateDeductee(d.id, 'section_code', e.target.value)} className="h-8 text-xs border rounded px-1 w-24">
                                                                    <option value="">Section</option>
                                                                    {sections.map(s => <option key={s.id} value={s.section_code}>{s.section_code} ({s.tds_rate}%)</option>)}
                                                                </select>
                                                                {sec && <p className="text-[10px] text-gray-500 mt-0.5">{sec.example_hint}</p>}
                                                                {errors[`sec_${d.id}`] && <p className="text-[10px] text-red-600 mt-0.5">{errors[`sec_${d.id}`]}</p>}
                                                            </td>
                                                            <td className="p-1.5">
                                                                <Input type="number" min="0" step="0.01" value={d.payment_amount} onChange={(e) => updateDeductee(d.id, 'payment_amount', e.target.value)} className="h-8 text-xs w-24 text-right" placeholder="0" />
                                                                {errors[`amt_${d.id}`] && <p className="text-[10px] text-red-600 mt-0.5">{errors[`amt_${d.id}`]}</p>}
                                                            </td>
                                                            <td className="p-1.5 text-center font-mono text-xs">{d.tds_rate || '-'}</td>
                                                            <td className="p-1.5 text-right font-mono text-xs font-bold text-orange-600">₹{parseFloat(d.tds_deducted || '0').toFixed(2)}</td>
                                                            <td className="p-1.5">
                                                                <button onClick={() => removeDeductee(d.id)} className="text-red-400 hover:text-red-600 p-1">
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                            <tfoot className="bg-gray-50 text-xs font-bold">
                                                <tr>
                                                    <td colSpan={4} className="p-2 text-right">Total</td>
                                                    <td className="p-2 text-right font-mono">₹{totalPaymentAmount.toFixed(2)}</td>
                                                    <td></td>
                                                    <td className="p-2 text-right font-mono text-orange-600">₹{totalTdsDeducted.toFixed(2)}</td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    {errors.deductees && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.deductees}</p>}

                                    <Button variant="outline" size="sm" onClick={addDeductee} className="text-xs">
                                        <Plus className="h-3.5 w-3.5 mr-1" />Add Deductee
                                    </Button>
                                </div>
                            )}

                            {/* Step 3: TDS Computation */}
                            {currentStep === 3 && (
                                <div className="space-y-5">
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <p className="text-sm font-bold text-amber-900">TDS Computation & Deposit</p>
                                        <p className="text-xs text-amber-700">Verify total TDS deducted across all deductees. Enter deposit details.</p>
                                    </div>

                                    <div className="bg-gray-50 border-2 rounded-xl p-6">
                                        <h4 className="font-bold mb-4">TDS Summary</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span>Total Deductees</span><span className="font-bold">{formData.deductees.filter(d => d.deductee_name).length}</span></div>
                                            <div className="flex justify-between"><span>Total Payment Amount</span><span className="font-bold">₹{totalPaymentAmount.toFixed(2)}</span></div>
                                            <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                                <span>Total TDS Deducted</span>
                                                <span className="text-orange-700">₹{totalTdsDeducted.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Total TDS Deposited (₹) *</Label>
                                            <Input type="number" min="0" step="0.01" value={formData.tds_deposited} onChange={(e) => updateField('tds_deposited', e.target.value)} className={errors.tds_deposited ? 'border-red-500' : ''} />
                                            {errors.tds_deposited && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.tds_deposited}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Deposit Date *</Label>
                                            <Input type="date" value={formData.deposit_date} onChange={(e) => updateField('deposit_date', e.target.value)} className={errors.deposit_date ? 'border-red-500' : ''} />
                                            {errors.deposit_date && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.deposit_date}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Challan */}
                            {currentStep === 4 && (
                                <div className="space-y-5">
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-sm font-bold text-red-900">Challan Details (ITNS 281)</p>
                                        <p className="text-xs text-red-700">Enter the challan details used for TDS deposit. 💡 BSR code: 7 digits.</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Challan Serial No. *</Label>
                                            <Input placeholder="e.g., CH-001" value={formData.challan_serial} onChange={(e) => updateField('challan_serial', e.target.value)} className={errors.challan_serial ? 'border-red-500' : ''} />
                                            {errors.challan_serial && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.challan_serial}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">BSR Code * (7 digits)</Label>
                                            <Input placeholder="e.g., 1234567" value={formData.bsr_code} onChange={(e) => updateField('bsr_code', e.target.value.replace(/\D/g, '').slice(0, 7))} className={`font-mono ${errors.bsr_code ? 'border-red-500' : ''}`} maxLength={7} />
                                            {errors.bsr_code && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.bsr_code}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Challan Date *</Label>
                                            <Input type="date" value={formData.challan_date} onChange={(e) => updateField('challan_date', e.target.value)} className={errors.challan_date ? 'border-red-500' : ''} />
                                            {errors.challan_date && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.challan_date}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Challan Amount (₹) *</Label>
                                            <Input type="number" min="0" step="0.01" value={formData.challan_amount} onChange={(e) => updateField('challan_amount', e.target.value)} className={errors.challan_amount ? 'border-red-500' : ''} />
                                            {errors.challan_amount && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.challan_amount}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Review */}
                            {currentStep === 5 && (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                        <div>
                                            <p className="font-bold text-green-800">Review Form 26Q</p>
                                            <p className="text-sm text-green-700">{formData.deductees.filter(d => d.deductee_name).length} deductees · Total TDS: ₹{totalTdsDeducted.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {errorList.length > 0 && <ErrorListPanel errors={errorList} />}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Card className="border-2">
                                            <CardHeader className="bg-gray-50 pb-2"><CardTitle className="text-sm font-bold">Deductor</CardTitle></CardHeader>
                                            <CardContent className="pt-3 text-sm space-y-1">
                                                <div className="flex justify-between"><span className="text-gray-500">TAN</span><span className="font-bold font-mono">{formData.deductor_tan}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-bold">{formData.deductor_name}</span></div>
                                            </CardContent>
                                        </Card>
                                        <Card className="border-2">
                                            <CardHeader className="bg-gray-50 pb-2"><CardTitle className="text-sm font-bold">Challan</CardTitle></CardHeader>
                                            <CardContent className="pt-3 text-sm space-y-1">
                                                <div className="flex justify-between"><span className="text-gray-500">BSR</span><span className="font-bold font-mono">{formData.bsr_code}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-bold">₹{parseFloat(formData.challan_amount).toFixed(2)}</span></div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>

            <div className="flex justify-between gap-4">
                <Button variant="outline" onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))} disabled={currentStep === 1} className="px-8">
                    <ArrowLeft className="h-4 w-4 mr-2" />Previous
                </Button>
                {currentStep < STEPS.length ? (
                    <Button onClick={handleNext} className="bg-orange-600 hover:bg-orange-700 px-8">
                        Next<ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={submitting} className="bg-orange-600 hover:bg-orange-700 px-8">
                        {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : <><CheckCircle2 className="h-4 w-4 mr-2" />Submit Form 26Q</>}
                    </Button>
                )}
            </div>
        </div>
    );
}
