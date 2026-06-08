'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, FileText,
    Building2, Calculator, Loader2, Info, Search, MapPin, Package,
    Plus, Trash2, Table2, FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api';
import { usePracticeScenario } from '@/hooks/usePracticeScenario';
import { ScenarioCard } from './shared/ScenarioCard';
import { PortalHeader } from './shared/PortalHeader';
import { ErrorListPanel } from './shared/ErrorListPanel';
import { PDFPreview } from './shared/PDFPreview';
import { INDIAN_STATES } from '@/lib/practiceTypes';
import type { HsnCode } from '@/lib/practiceTypes';
import type { InvoiceEntry, HsnSummaryRow } from '@/lib/practiceTypes';
import { createEmptyInvoice } from '@/lib/practiceTypes';

interface GSTFormData {
    gstin: string;
    business_name: string;
    b2bInvoices: InvoiceEntry[];
    b2cInvoices: InvoiceEntry[];
}

interface GSTPracticePortalProps {
    allocationId: number;
    onSuccess: () => void;
}

const STEPS = [
    { id: 1, title: 'Supplier', icon: Building2 },
    { id: 2, title: 'B2B Invoices', icon: Table2 },
    { id: 3, title: 'B2C Invoices', icon: Package },
    { id: 4, title: 'HSN Summary', icon: FileSpreadsheet },
    { id: 5, title: 'Review', icon: CheckCircle2 }
];

const STORAGE_KEY = 'ems_gst_draft';
const DIFFICULTY_ID = 'ems_gst_seen_scenarios';

function getSeenIds(): number[] {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(sessionStorage.getItem(DIFFICULTY_ID) || '[]'); } catch { return []; }
}

function addSeenId(id: number) {
    const ids = getSeenIds();
    if (!ids.includes(id)) { ids.push(id); sessionStorage.setItem(DIFFICULTY_ID, JSON.stringify(ids)); }
}

function loadDraft(): Partial<GSTFormData> | null {
    if (typeof window === 'undefined') return null;
    try { const s = sessionStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}

function saveDraft(data: Partial<GSTFormData>) {
    if (typeof window === 'undefined') return;
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { }
}

function clearDraft() {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(STORAGE_KEY);
}

function calcTaxRow(taxable: number, rate: number, isInterState: boolean) {
    if (taxable <= 0 || rate <= 0) return { cgst: 0, sgst: 0, igst: 0, total: taxable };
    if (isInterState) {
        const igst = (taxable * rate) / 100;
        return { cgst: 0, sgst: 0, igst, total: taxable + igst };
    }
    const cgst = (taxable * rate) / 200;
    const sgst = (taxable * rate) / 200;
    return { cgst, sgst, igst: 0, total: taxable + cgst + sgst };
}

export function GSTPracticePortal({ allocationId, onSuccess }: GSTPracticePortalProps) {
    const [seenIds, setSeenIds] = useState<number[]>(() => getSeenIds());
    const { scenario, loading: scenarioLoading, currentHintIndex, showNextHint, error: scenarioError } = usePracticeScenario('GST', seenIds);
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [hsnCodes, setHsnCodes] = useState<HsnCode[]>([]);
    const [hsnSearch, setHsnSearch] = useState('');
    const [activeInvoiceType, setActiveInvoiceType] = useState<'B2B' | 'B2C'>('B2B');

    const [formData, setFormData] = useState<GSTFormData>(() => {
        const draft = loadDraft();
        return {
            gstin: draft?.gstin || '',
            business_name: draft?.business_name || '',
            b2bInvoices: draft?.b2bInvoices?.length ? draft.b2bInvoices : [createEmptyInvoice('B2B')],
            b2cInvoices: draft?.b2cInvoices?.length ? draft.b2cInvoices : [createEmptyInvoice('B2C')]
        };
    });

    const supplierGstin = formData.gstin;

    // Load HSN codes
    useEffect(() => {
        api.get('/ems/practice/data?type=hsn').then(res => {
            setHsnCodes(res.data?.data || []);
        }).catch(() => { });
    }, []);

    useEffect(() => {
        if (scenario) { addSeenId(scenario.id); setSeenIds(getSeenIds()); }
    }, [scenario]);

    useEffect(() => {
        const timer = setTimeout(() => saveDraft(formData), 800);
        return () => clearTimeout(timer);
    }, [formData]);

    const filteredHsn = useMemo(() =>
        hsnCodes.filter(h =>
            h.hsn_code.includes(hsnSearch) ||
            h.description.toLowerCase().includes(hsnSearch.toLowerCase()) ||
            h.category.toLowerCase().includes(hsnSearch.toLowerCase())
        ),
        [hsnCodes, hsnSearch]
    );

    const validateGSTIN = (gstin: string): boolean =>
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin);

    const allInvoices = useMemo(() => [...formData.b2bInvoices, ...formData.b2cInvoices], [formData.b2bInvoices, formData.b2cInvoices]);

    const hsnSummary = useMemo((): HsnSummaryRow[] => {
        const grouped = new Map<string, { desc: string; rate: number; taxable: number; cgst: number; sgst: number; igst: number; total: number }>();
        for (const inv of allInvoices) {
            if (!inv.hsn_code) continue;
            const existing = grouped.get(inv.hsn_code) || { desc: inv.item_description, rate: parseFloat(inv.gst_rate || '0'), taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
            existing.taxable += parseFloat(inv.taxable_value || '0');
            existing.cgst += parseFloat(inv.cgst || '0');
            existing.sgst += parseFloat(inv.sgst || '0');
            existing.igst += parseFloat(inv.igst || '0');
            existing.total += parseFloat(inv.total_amount || '0');
            if (!grouped.has(inv.hsn_code)) grouped.set(inv.hsn_code, existing);
        }
        return Array.from(grouped.entries()).map(([code, data]) => ({
            hsn_code: code, description: data.desc, gst_rate: data.rate,
            taxable_value: data.taxable, cgst: data.cgst, sgst: data.sgst, igst: data.igst, total: data.total
        }));
    }, [allInvoices]);

    const totalTaxable = useMemo(() => hsnSummary.reduce((a, r) => a + r.taxable_value, 0), [hsnSummary]);
    const totalTax = useMemo(() => hsnSummary.reduce((a, r) => a + r.cgst + r.sgst + r.igst, 0), [hsnSummary]);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
        }
    };

    const updateInvoice = useCallback((list: 'b2bInvoices' | 'b2cInvoices', id: string, field: string, value: string) => {
        setFormData(prev => {
            const invoices = prev[list].map(inv => {
                if (inv.id !== id) return inv;
                const next = { ...inv, [field]: value };

                // Auto-calc taxable value
                if (field === 'quantity' || field === 'unit_price') {
                    const qty = parseFloat(field === 'quantity' ? value : inv.quantity || '0');
                    const price = parseFloat(field === 'unit_price' ? value : inv.unit_price || '0');
                    next.taxable_value = (qty * price).toFixed(2);
                }

                // Auto-calc tax
                if (['taxable_value', 'gst_rate', 'customer_gstin'].includes(field) || field === 'quantity' || field === 'unit_price') {
                    const taxable = parseFloat(next.taxable_value || '0');
                    const rate = parseFloat(next.gst_rate || '0');
                    const isInterState = !!(prev.gstin && next.customer_gstin &&
                        prev.gstin.substring(0, 2) !== next.customer_gstin.substring(0, 2));
                    const result = calcTaxRow(taxable, rate, isInterState);
                    next.cgst = result.cgst.toFixed(2);
                    next.sgst = result.sgst.toFixed(2);
                    next.igst = result.igst.toFixed(2);
                    next.total_amount = result.total.toFixed(2);
                }

                // Auto-fill from HSN code
                if (field === 'hsn_code') {
                    const hsn = hsnCodes.find(h => h.hsn_code === value);
                    if (hsn) {
                        next.gst_rate = String(hsn.gst_rate);
                        next.item_description = hsn.description;
                    }
                }

                return next;
            });
            return { ...prev, [list]: invoices };
        });
    }, [hsnCodes, formData.gstin]);

    const addInvoice = (type: 'B2B' | 'B2C') => {
        const key = type === 'B2B' ? 'b2bInvoices' : 'b2cInvoices';
        setFormData(prev => ({ ...prev, [key]: [...prev[key], createEmptyInvoice(type)] }));
    };

    const removeInvoice = (list: 'b2bInvoices' | 'b2cInvoices', id: string) => {
        setFormData(prev => {
            const filtered = prev[list].filter(inv => inv.id !== id);
            return { ...prev, [list]: filtered.length ? filtered : [createEmptyInvoice(list === 'b2bInvoices' ? 'B2B' : 'B2C')] };
        });
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};
        switch (step) {
            case 1:
                if (!formData.gstin) newErrors.gstin = 'GSTIN is required';
                else if (!validateGSTIN(formData.gstin)) newErrors.gstin = 'Format: 29ABCDE1234F1Z5';
                if (!formData.business_name) newErrors.business_name = 'Business name is required';
                break;
            case 2:
                if (formData.b2bInvoices.length === 0 || formData.b2bInvoices.every(inv => !inv.customer_name)) {
                    newErrors.b2b = 'At least one B2B invoice with customer name required';
                }
                for (const inv of formData.b2bInvoices) {
                    if (!inv.customer_name) continue;
                    if (!inv.hsn_code) newErrors[`hsn_${inv.id}`] = 'HSN code required';
                    if (!inv.taxable_value || parseFloat(inv.taxable_value) <= 0) newErrors[`taxable_${inv.id}`] = 'Valid taxable value required';
                }
                break;
            case 3:
                for (const inv of formData.b2cInvoices) {
                    if (!inv.hsn_code && !inv.item_description) continue;
                    if (!inv.taxable_value || parseFloat(inv.taxable_value) <= 0) newErrors[`taxable_b2c_${inv.id}`] = 'Valid taxable value required';
                }
                break;
            case 4:
                if (hsnSummary.length === 0) newErrors.hsn = 'No HSN entries to summarize';
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
            const payload = {
                allocationId,
                gstin: formData.gstin,
                business_name: formData.business_name,
                invoices: allInvoices.map(inv => ({
                    invoice_number: inv.invoice_number,
                    invoice_date: inv.invoice_date,
                    invoice_type: inv.invoice_type,
                    customer_name: inv.customer_name,
                    customer_gstin: inv.customer_gstin,
                    hsn_code: inv.hsn_code,
                    item_description: inv.item_description,
                    quantity: parseInt(inv.quantity || '0'),
                    unit_price: parseFloat(inv.unit_price || '0'),
                    taxable_value: parseFloat(inv.taxable_value || '0'),
                    gst_rate: parseFloat(inv.gst_rate || '0'),
                    cgst: parseFloat(inv.cgst || '0'),
                    sgst: parseFloat(inv.sgst || '0'),
                    igst: parseFloat(inv.igst || '0'),
                    total_amount: parseFloat(inv.total_amount || '0')
                })),
                hsn_summary: hsnSummary,
                total_taxable: totalTaxable,
                total_tax: totalTax
            };
            await api.post('/ems/practice/student/gst/entry', payload);
            clearDraft();
            toast.success('GSTR-1 return submitted successfully!');
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
            list.push({ field: key, message: msg, severity: 'error' });
        }
        // Warnings
        if (formData.gstin && !validateGSTIN(formData.gstin)) {
            list.push({ field: 'GSTIN Format', message: 'GSTIN should be 15 characters: 2-digit state + 10-char PAN + 1 digit + Z + checksum', severity: 'warning' });
        }
        const interStateInvoices = allInvoices.filter(inv => inv.customer_gstin && formData.gstin &&
            inv.customer_gstin.substring(0, 2) !== formData.gstin.substring(0, 2) && parseFloat(inv.igst || '0') === 0);
        for (const inv of interStateInvoices) {
            list.push({ field: `Invoice ${inv.invoice_number}`, message: 'Inter-state supply but IGST is 0. Use IGST instead of CGST+SGST.', severity: 'warning' });
        }
        return list;
    }, [errors, formData.gstin, allInvoices]);

    if (scenarioLoading) {
        return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;
    }

    if (!scenario) {
        return <Card className="border-2 border-amber-200 bg-amber-50"><CardContent className="p-8 text-center"><Info className="h-12 w-12 text-amber-500 mx-auto mb-4" /><p className="text-lg font-bold text-amber-800">No scenarios available</p><p className="text-sm text-amber-600">{scenarioError || 'Check back later for new practice scenarios.'}</p></CardContent></Card>;
    }

    const renderInvoiceTable = (invoices: InvoiceEntry[], listKey: 'b2bInvoices' | 'b2cInvoices', showGstin: boolean) => (
        <div className="space-y-4">
            <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-xs uppercase font-bold text-gray-600">
                        <tr>
                            <th className="p-2 text-left">#</th>
                            {showGstin && <th className="p-2 text-left">Customer GSTIN</th>}
                            <th className="p-2 text-left">Customer Name</th>
                            <th className="p-2 text-left">HSN</th>
                            <th className="p-2 text-right">Qty</th>
                            <th className="p-2 text-right">Price</th>
                            <th className="p-2 text-right">Taxable</th>
                            <th className="p-2 text-right">CGST</th>
                            <th className="p-2 text-right">SGST</th>
                            <th className="p-2 text-right">IGST</th>
                            <th className="p-2 text-right">Total</th>
                            <th className="p-2"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {invoices.map((inv, idx) => (
                            <tr key={inv.id} className="hover:bg-gray-50">
                                <td className="p-1.5 text-center text-gray-400 text-xs">{idx + 1}</td>
                                {showGstin && (
                                    <td className="p-1.5">
                                        <Input
                                            value={inv.customer_gstin}
                                            onChange={(e) => updateInvoice(listKey, inv.id, 'customer_gstin', e.target.value.toUpperCase())}
                                            className="h-8 text-xs font-mono w-36"
                                            placeholder="GSTIN"
                                            maxLength={15}
                                        />
                                    </td>
                                )}
                                <td className="p-1.5">
                                    <Input
                                        value={inv.customer_name}
                                        onChange={(e) => updateInvoice(listKey, inv.id, 'customer_name', e.target.value)}
                                        className="h-8 text-xs w-32"
                                        placeholder="Name"
                                    />
                                </td>
                                <td className="p-1.5">
                                    <select
                                        value={inv.hsn_code}
                                        onChange={(e) => updateInvoice(listKey, inv.id, 'hsn_code', e.target.value)}
                                        className="h-8 text-xs border rounded px-1 w-20 font-mono"
                                    >
                                        <option value="">HSN</option>
                                        {hsnCodes.map(h => <option key={h.id} value={h.hsn_code}>{h.hsn_code}</option>)}
                                    </select>
                                </td>
                                <td className="p-1.5">
                                    <Input type="number" min="1" value={inv.quantity} onChange={(e) => updateInvoice(listKey, inv.id, 'quantity', e.target.value)} className="h-8 text-xs w-16 text-right" />
                                </td>
                                <td className="p-1.5">
                                    <Input type="number" min="0" step="0.01" value={inv.unit_price} onChange={(e) => updateInvoice(listKey, inv.id, 'unit_price', e.target.value)} className="h-8 text-xs w-20 text-right" placeholder="0" />
                                </td>
                                <td className="p-1.5 text-right font-mono text-xs font-bold">₹{parseFloat(inv.taxable_value || '0').toFixed(2)}</td>
                                <td className="p-1.5 text-right font-mono text-xs text-blue-600">{parseFloat(inv.cgst || '0').toFixed(2)}</td>
                                <td className="p-1.5 text-right font-mono text-xs text-blue-600">{parseFloat(inv.sgst || '0').toFixed(2)}</td>
                                <td className="p-1.5 text-right font-mono text-xs text-amber-600">{parseFloat(inv.igst || '0').toFixed(2)}</td>
                                <td className="p-1.5 text-right font-mono text-xs font-bold">₹{parseFloat(inv.total_amount || '0').toFixed(2)}</td>
                                <td className="p-1.5">
                                    <button onClick={() => removeInvoice(listKey, inv.id)} className="text-red-400 hover:text-red-600 p-1">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {errors[listKey === 'b2bInvoices' ? 'b2b' : 'b2c'] && (
                <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors[listKey === 'b2bInvoices' ? 'b2b' : 'b2c']}</p>
            )}

            <Button variant="outline" size="sm" onClick={() => addInvoice(listKey === 'b2bInvoices' ? 'B2B' : 'B2C')} className="text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" />Add {listKey === 'b2bInvoices' ? 'B2B' : 'B2C'} Invoice
            </Button>
        </div>
    );

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <PortalHeader
                title="GSTR-1 — Sales Return"
                subtitle="Goods and Services Tax Return for outward supplies"
                color="green"
                badge="📋 GST PRACTICE LAB"
                attemptInfo={{ used: 0, limit: 5 }}
            />

            <ScenarioCard scenario={scenario} currentHintIndex={currentHintIndex} onShowNextHint={showNextHint} />

            {errorList.length > 0 && currentStep < 5 && (
                <ErrorListPanel
                    errors={errorList}
                    onDismiss={(field) => { setErrors(prev => { const n = { ...prev }; delete n[field]; return n; }); }}
                />
            )}

            <Card className="border-0 shadow-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold">Step {currentStep} of {STEPS.length}</p>
                        <Badge className="bg-white/20 text-white border-white/30">{Math.round(progress)}% Complete</Badge>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                        <motion.div className="bg-white h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                    </div>
                    <div className="flex justify-between mt-3">
                        {STEPS.map((step) => {
                            const Icon = step.icon;
                            const isDone = currentStep > step.id;
                            const isCur = currentStep === step.id;
                            return (
                                <div key={step.id} className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${isDone ? 'bg-white text-green-700' : isCur ? 'bg-white/30 text-white ring-2 ring-white' : 'bg-white/10 text-white/60'}`}>
                                        {isDone ? <CheckCircle2 className="h-5 w-5" /> : step.id}
                                    </div>
                                    <p className={`text-[10px] mt-1 font-bold text-center ${isCur ? 'text-white' : 'text-white/60'}`}>{step.title}</p>
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
                                <div className="p-2 bg-green-100 rounded-lg">
                                    {(() => { const Icon = STEPS[currentStep - 1].icon; return <Icon className="h-5 w-5 text-green-600" />; })()}
                                </div>
                                {STEPS[currentStep - 1].title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Step 1: Supplier */}
                            {currentStep === 1 && (
                                <div className="space-y-5">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                                        <Info className="h-5 w-5 text-green-600 shrink-0" />
                                        <div className="text-sm text-green-900">
                                            <p className="font-bold">Your Business Details</p>
                                            <p>Enter your registered GSTIN and business name as per GST registration. 💡 GSTIN: 15 digits — first 2 digits = state code.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">GSTIN *</Label>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                placeholder="e.g., 29ABCDE1234F1Z5"
                                                value={formData.gstin}
                                                onChange={(e) => updateField('gstin', e.target.value.toUpperCase())}
                                                className={`font-mono text-lg tracking-wider flex-1 ${errors.gstin ? 'border-red-500' : ''}`}
                                                maxLength={15}
                                            />
                                            <Button variant="outline" size="sm" onClick={() => updateField('gstin', '33ABCDE1234F1Z5')} className="text-xs shrink-0">Sample</Button>
                                        </div>
                                        {errors.gstin && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.gstin}</p>}
                                        <p className="text-xs text-gray-400">Format: 2-digit state code + 10-char PAN + 1 digit + Z + checksum. Tamil Nadu = 33</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Business / Trade Name *</Label>
                                        <Input
                                            placeholder="e.g., ABC Enterprises Pvt Ltd"
                                            value={formData.business_name}
                                            onChange={(e) => updateField('business_name', e.target.value)}
                                            className={errors.business_name ? 'border-red-500' : ''}
                                        />
                                        {errors.business_name && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.business_name}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: B2B Invoices */}
                            {currentStep === 2 && (
                                <div className="space-y-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                                        <Info className="h-5 w-5 text-blue-600 shrink-0" />
                                        <div className="text-sm text-blue-900">
                                            <p className="font-bold">B2B Invoices (Business-to-Business)</p>
                                            <p>Add invoices to registered taxpayers. Each row = one invoice line item. Customer GSTIN required for B2B.</p>
                                        </div>
                                    </div>
                                    {renderInvoiceTable(formData.b2bInvoices, 'b2bInvoices', true)}
                                </div>
                            )}

                            {/* Step 3: B2C Invoices */}
                            {currentStep === 3 && (
                                <div className="space-y-4">
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex gap-3">
                                        <Info className="h-5 w-5 text-purple-600 shrink-0" />
                                        <div className="text-sm text-purple-900">
                                            <p className="font-bold">B2C Invoices (Business-to-Consumer)</p>
                                            <p>Small invoices to unregistered customers. No GSTIN needed. Use for retail sales.</p>
                                        </div>
                                    </div>
                                    {renderInvoiceTable(formData.b2cInvoices, 'b2cInvoices', false)}
                                </div>
                            )}

                            {/* Step 4: HSN Summary */}
                            {currentStep === 4 && (
                                <div className="space-y-5">
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                                        <FileSpreadsheet className="h-5 w-5 text-amber-600 shrink-0" />
                                        <div className="text-sm text-amber-900">
                                            <p className="font-bold">HSN-wise Summary of Outward Supplies</p>
                                            <p>Auto-generated from your invoices. Verify totals match your entries.</p>
                                        </div>
                                    </div>

                                    {hsnSummary.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400">
                                            <FileSpreadsheet className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm font-bold">No HSN entries yet</p>
                                            <p className="text-xs">Add invoices in B2B/B2C steps first</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto border rounded-xl">
                                            <table className="w-full text-sm">
                                                <thead className="bg-amber-100 text-xs uppercase font-bold text-amber-800">
                                                    <tr>
                                                        <th className="p-3 text-left">HSN/SAC</th>
                                                        <th className="p-3 text-left">Description</th>
                                                        <th className="p-3 text-right">Rate</th>
                                                        <th className="p-3 text-right">Taxable Value</th>
                                                        <th className="p-3 text-right">CGST</th>
                                                        <th className="p-3 text-right">SGST</th>
                                                        <th className="p-3 text-right">IGST</th>
                                                        <th className="p-3 text-right">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {hsnSummary.map((row, i) => (
                                                        <tr key={row.hsn_code} className="hover:bg-amber-50">
                                                            <td className="p-3 font-mono font-bold">{row.hsn_code}</td>
                                                            <td className="p-3 text-gray-600">{row.description}</td>
                                                            <td className="p-3 text-right">{row.gst_rate}%</td>
                                                            <td className="p-3 text-right font-mono font-bold">₹{row.taxable_value.toFixed(2)}</td>
                                                            <td className="p-3 text-right font-mono text-blue-600">₹{row.cgst.toFixed(2)}</td>
                                                            <td className="p-3 text-right font-mono text-blue-600">₹{row.sgst.toFixed(2)}</td>
                                                            <td className="p-3 text-right font-mono text-amber-600">₹{row.igst.toFixed(2)}</td>
                                                            <td className="p-3 text-right font-mono font-bold">₹{row.total.toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="bg-amber-50 font-bold text-sm">
                                                    <tr>
                                                        <td colSpan={3} className="p-3 text-right">Totals</td>
                                                        <td className="p-3 text-right font-mono">₹{totalTaxable.toFixed(2)}</td>
                                                        <td className="p-3 text-right font-mono text-blue-600">₹{hsnSummary.reduce((a, r) => a + r.cgst, 0).toFixed(2)}</td>
                                                        <td className="p-3 text-right font-mono text-blue-600">₹{hsnSummary.reduce((a, r) => a + r.sgst, 0).toFixed(2)}</td>
                                                        <td className="p-3 text-right font-mono text-amber-600">₹{hsnSummary.reduce((a, r) => a + r.igst, 0).toFixed(2)}</td>
                                                        <td className="p-3 text-right font-mono">₹{hsnSummary.reduce((a, r) => a + r.total, 0).toFixed(2)}</td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    )}

                                    {errors.hsn && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.hsn}</p>}
                                </div>
                            )}

                            {/* Step 5: Review */}
                            {currentStep === 5 && (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                                        <div>
                                            <p className="font-bold text-green-800">Review GSTR-1</p>
                                            <p className="text-sm text-green-700">
                                                {allInvoices.length} invoice{allInvoices.length !== 1 ? 's' : ''} · {hsnSummary.length} HSN line{hsnSummary.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Error List */}
                                    {errorList.length > 0 && (
                                        <ErrorListPanel errors={errorList} />
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Card className="border-2">
                                            <CardHeader className="bg-gray-50 pb-2"><CardTitle className="text-sm font-bold">Supplier</CardTitle></CardHeader>
                                            <CardContent className="pt-3 text-sm space-y-1">
                                                <div className="flex justify-between"><span className="text-gray-500">GSTIN</span><span className="font-bold font-mono">{formData.gstin}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-500">Business</span><span className="font-bold">{formData.business_name}</span></div>
                                            </CardContent>
                                        </Card>
                                        <Card className="border-2">
                                            <CardHeader className="bg-gray-50 pb-2"><CardTitle className="text-sm font-bold">Summary</CardTitle></CardHeader>
                                            <CardContent className="pt-3 text-sm space-y-1">
                                                <div className="flex justify-between"><span className="text-gray-500">B2B Invoices</span><span className="font-bold">{formData.b2bInvoices.filter(i => i.customer_name).length}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-500">B2C Invoices</span><span className="font-bold">{formData.b2cInvoices.filter(i => i.item_description).length}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-500">Total Taxable</span><span className="font-bold">₹{totalTaxable.toFixed(2)}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-500">Total Tax</span><span className="font-bold text-blue-700">₹{totalTax.toFixed(2)}</span></div>
                                                <div className="border-t pt-1 flex justify-between font-bold text-lg">
                                                    <span>Grand Total</span>
                                                    <span className="text-green-700">₹{(totalTaxable + totalTax).toFixed(2)}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Invoice list preview */}
                                    {allInvoices.filter(i => i.customer_name || i.item_description).length > 0 && (
                                        <Card className="border-2">
                                            <CardHeader className="bg-gray-50 pb-2"><CardTitle className="text-sm font-bold">All Invoices ({allInvoices.filter(i => i.customer_name || i.item_description).length})</CardTitle></CardHeader>
                                            <CardContent className="pt-3">
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-xs">
                                                        <thead>
                                                            <tr className="text-gray-500 border-b">
                                                                <th className="p-1.5 text-left">Type</th>
                                                                <th className="p-1.5 text-left">Customer</th>
                                                                <th className="p-1.5 text-left">HSN</th>
                                                                <th className="p-1.5 text-right">Taxable</th>
                                                                <th className="p-1.5 text-right">Tax</th>
                                                                <th className="p-1.5 text-right">Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {allInvoices.filter(i => i.customer_name || i.item_description).map((inv, i) => (
                                                                <tr key={inv.id} className="border-b hover:bg-gray-50">
                                                                    <td className="p-1.5"><Badge variant={inv.invoice_type === 'B2B' ? 'default' : 'secondary'} className="text-[10px]">{inv.invoice_type}</Badge></td>
                                                                    <td className="p-1.5 font-medium">{inv.customer_name || '-'}</td>
                                                                    <td className="p-1.5 font-mono">{inv.hsn_code || '-'}</td>
                                                                    <td className="p-1.5 text-right font-mono">₹{parseFloat(inv.taxable_value || '0').toFixed(2)}</td>
                                                                    <td className="p-1.5 text-right font-mono text-blue-600">₹{(parseFloat(inv.cgst || '0') + parseFloat(inv.sgst || '0') + parseFloat(inv.igst || '0')).toFixed(2)}</td>
                                                                    <td className="p-1.5 text-right font-mono font-bold">₹{parseFloat(inv.total_amount || '0').toFixed(2)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between gap-4">
                <Button variant="outline" onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))} disabled={currentStep === 1} className="px-8">
                    <ArrowLeft className="h-4 w-4 mr-2" />Previous
                </Button>
                <div className="flex items-center gap-2">
                    {currentStep === STEPS.length && (
                        <PDFPreview title="GSTR-1 — Sales Return" filename={`GSTR-1_${formData.gstin || 'draft'}`}>
                            <h2>Supplier Details</h2>
                            <div className="row"><span className="label">GSTIN:</span><span className="value">{formData.gstin}</span></div>
                            <div className="row"><span className="label">Business Name:</span><span className="value">{formData.business_name}</span></div>

                            <h2>Invoice Summary</h2>
                            <div className="row"><span className="label">Total B2B Invoices:</span><span className="value">{formData.b2bInvoices.filter(i => i.customer_name).length}</span></div>
                            <div className="row"><span className="label">Total B2C Invoices:</span><span className="value">{formData.b2cInvoices.filter(i => i.item_description).length}</span></div>
                            <div className="row"><span className="label">Total Taxable Value:</span><span className="value">₹{totalTaxable.toFixed(2)}</span></div>
                            <div className="row"><span className="label">Total Tax:</span><span className="value">₹{totalTax.toFixed(2)}</span></div>
                            <div className="row" style={{ borderTop: '2px solid #000', paddingTop: '8px', marginTop: '8px', fontWeight: 'bold' }}><span className="label">Grand Total:</span><span className="value">₹{(totalTaxable + totalTax).toFixed(2)}</span></div>

                            {hsnSummary.length > 0 && (
                                <>
                                    <h2>HSN-wise Summary</h2>
                                    <table>
                                        <thead><tr><th>HSN</th><th>Description</th><th>Rate</th><th>Taxable</th><th>CGST</th><th>SGST</th><th>IGST</th><th>Total</th></tr></thead>
                                        <tbody>
                                            {hsnSummary.map(row => (
                                                <tr key={row.hsn_code}>
                                                    <td>{row.hsn_code}</td>
                                                    <td>{row.description}</td>
                                                    <td>{row.gst_rate}%</td>
                                                    <td>₹{row.taxable_value.toFixed(2)}</td>
                                                    <td>₹{row.cgst.toFixed(2)}</td>
                                                    <td>₹{row.sgst.toFixed(2)}</td>
                                                    <td>₹{row.igst.toFixed(2)}</td>
                                                    <td>₹{row.total.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}
                        </PDFPreview>
                    )}
                    {currentStep < STEPS.length ? (
                        <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700 px-8">
                            Next<ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={submitting} className="bg-green-600 hover:bg-green-700 px-8">
                            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : <><CheckCircle2 className="h-4 w-4 mr-2" />Submit GSTR-1</>}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
