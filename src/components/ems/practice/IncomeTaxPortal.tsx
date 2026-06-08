'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, User, Home, Calculator, FileText, Loader2, Info, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api';

interface ITFormData {
    pan_number: string;
    assessment_year: string;
    taxpayer_name: string;
    date_of_birth: string;

    // Income from Salary
    salary_income: string;
    allowances: string;
    perquisites: string;

    // Income from House Property
    rental_income: string;
    municipal_taxes: string;
    interest_on_loan: string;

    // Income from Other Sources
    interest_income: string;
    other_income: string;

    // Deductions
    deductions_80c: string;
    deductions_80d: string;
    deductions_other: string;

    // Computed fields
    gross_total_income: string;
    total_deductions: string;
    taxable_income: string;
    tax_payable: string;
}

interface ITPortalProps {
    allocationId: number;
    onSuccess: () => void;
}

const STEPS = [
    { id: 1, title: 'Personal Details', icon: User },
    { id: 2, title: 'Salary Income', icon: IndianRupee },
    { id: 3, title: 'House Property', icon: Home },
    { id: 4, title: 'Other Income', icon: FileText },
    { id: 5, title: 'Deductions', icon: Calculator },
    { id: 6, title: 'Tax Computation', icon: Calculator },
    { id: 7, title: 'Review & Submit', icon: CheckCircle2 }
];

const TAX_SLABS = [
    { min: 0, max: 250000, rate: 0 },
    { min: 250001, max: 500000, rate: 5 },
    { min: 500001, max: 750000, rate: 10 },
    { min: 750001, max: 1000000, rate: 15 },
    { min: 1000001, max: 1250000, rate: 20 },
    { min: 1250001, max: 1500000, rate: 25 },
    { min: 1500001, max: Infinity, rate: 30 }
];

export function IncomeTaxPortal({ allocationId, onSuccess }: ITPortalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<ITFormData>({
        pan_number: '',
        assessment_year: '2024-25',
        taxpayer_name: '',
        date_of_birth: '',
        salary_income: '0',
        allowances: '0',
        perquisites: '0',
        rental_income: '0',
        municipal_taxes: '0',
        interest_on_loan: '0',
        interest_income: '0',
        other_income: '0',
        deductions_80c: '0',
        deductions_80d: '0',
        deductions_other: '0',
        gross_total_income: '0',
        total_deductions: '0',
        taxable_income: '0',
        tax_payable: '0'
    });

    const validatePAN = (pan: string): boolean => {
        return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
    };

    const calculateTax = (taxableIncome: number): number => {
        let tax = 0;
        let remaining = taxableIncome;

        for (let i = 0; i < TAX_SLABS.length; i++) {
            const slab = TAX_SLABS[i];
            if (remaining <= 0) break;

            const slabIncome = Math.min(remaining, slab.max - slab.min);
            tax += (slabIncome * slab.rate) / 100;
            remaining -= slabIncome;
        }

        // Add 4% cess
        return tax * 1.04;
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        switch (step) {
            case 1:
                if (!formData.pan_number) newErrors.pan_number = 'PAN is required';
                else if (!validatePAN(formData.pan_number)) newErrors.pan_number = 'Invalid PAN format (e.g., ABCDE1234F)';
                if (!formData.taxpayer_name) newErrors.taxpayer_name = 'Name is required';
                if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
                break;
            case 2:
                if (parseFloat(formData.salary_income) < 0) newErrors.salary_income = 'Invalid amount';
                break;
            case 3:
                if (parseFloat(formData.rental_income) < 0) newErrors.rental_income = 'Invalid amount';
                break;
            case 4:
                if (parseFloat(formData.interest_income) < 0) newErrors.interest_income = 'Invalid amount';
                break;
            case 5:
                const deduction80c = parseFloat(formData.deductions_80c || '0');
                if (deduction80c > 150000) {
                    newErrors.deductions_80c = 'Maximum limit for 80C is ₹1,50,000';
                }
                const deduction80d = parseFloat(formData.deductions_80d || '0');
                if (deduction80d > 25000) {
                    newErrors.deductions_80d = 'Maximum limit for 80D is ₹25,000 (₹50,000 for senior citizens)';
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const updateField = (field: keyof ITFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Auto-calculate totals
        setTimeout(() => {
            const salary = parseFloat(field === 'salary_income' ? value : formData.salary_income || '0');
            const allowances = parseFloat(field === 'allowances' ? value : formData.allowances || '0');
            const perquisites = parseFloat(field === 'perquisites' ? value : formData.perquisites || '0');
            const rental = parseFloat(field === 'rental_income' ? value : formData.rental_income || '0');
            const municipal = parseFloat(field === 'municipal_taxes' ? value : formData.municipal_taxes || '0');
            const loanInterest = parseFloat(field === 'interest_on_loan' ? value : formData.interest_on_loan || '0');
            const interest = parseFloat(field === 'interest_income' ? value : formData.interest_income || '0');
            const other = parseFloat(field === 'other_income' ? value : formData.other_income || '0');
            const ded80c = parseFloat(field === 'deductions_80c' ? value : formData.deductions_80c || '0');
            const ded80d = parseFloat(field === 'deductions_80d' ? value : formData.deductions_80d || '0');
            const dedOther = parseFloat(field === 'deductions_other' ? value : formData.deductions_other || '0');

            const salaryTotal = salary + allowances + perquisites;
            const housePropertyIncome = Math.max(0, rental - municipal - loanInterest);
            const otherSourcesIncome = interest + other;
            const grossTotal = salaryTotal + housePropertyIncome + otherSourcesIncome;
            const totalDeductions = Math.min(ded80c, 150000) + Math.min(ded80d, 25000) + dedOther;
            const taxable = Math.max(0, grossTotal - totalDeductions);
            const tax = calculateTax(taxable);

            setFormData(prev => ({
                ...prev,
                [field]: value,
                gross_total_income: grossTotal.toFixed(2),
                total_deductions: totalDeductions.toFixed(2),
                taxable_income: taxable.toFixed(2),
                tax_payable: tax.toFixed(2)
            }));
        }, 0);

        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
        } else {
            toast.error('Please fix the errors before proceeding');
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await api.post('/ems/practice/student/it/return', {
                allocationId,
                ...formData,
                salary_income: parseFloat(formData.salary_income),
                gross_total_income: parseFloat(formData.gross_total_income),
                deductions_80c: parseFloat(formData.deductions_80c),
                deductions_other: parseFloat(formData.deductions_other),
                taxable_income: parseFloat(formData.taxable_income),
                tax_payable: parseFloat(formData.tax_payable)
            });
            toast.success('Income Tax Return submitted successfully!');
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest opacity-80">ITR-1 (Sahaj) - Income Tax Return</p>
                            <h3 className="text-xl font-bold">Step {currentStep} of {STEPS.length}</h3>
                        </div>
                        <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                            {Math.round(progress)}% Complete
                        </Badge>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                        <motion.div className="bg-white h-2 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between overflow-x-auto pb-2">
                {STEPS.map((step) => {
                    const Icon = step.icon;
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;
                    return (
                        <div key={step.id} className="flex flex-col items-center flex-1 min-w-[80px]">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCompleted ? 'bg-blue-500 text-white' :
                                    isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-200' :
                                        'bg-gray-200 text-gray-400'
                                }`}>
                                {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                            </div>
                            <p className={`text-xs mt-2 font-bold text-center ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                                {step.title}
                            </p>
                        </div>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <Card className="border-0 shadow-xl">
                        <CardHeader className="bg-gray-50 border-b">
                            <CardTitle className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    {(() => { const Icon = STEPS[currentStep - 1].icon; return <Icon className="h-5 w-5 text-blue-600" />; })()}
                                </div>
                                <p className="text-lg">{STEPS[currentStep - 1].title}</p>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                                        <Info className="h-5 w-5 text-blue-600 shrink-0" />
                                        <div className="text-sm text-blue-900">
                                            <p className="font-bold">Personal Information</p>
                                            <p>Enter your details as per PAN card</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">PAN Number *</Label>
                                        <Input placeholder="e.g., ABCDE1234F" value={formData.pan_number} onChange={(e) => updateField('pan_number', e.target.value.toUpperCase())} className={`font-mono ${errors.pan_number ? 'border-red-500' : ''}`} maxLength={10} />
                                        {errors.pan_number && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.pan_number}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Full Name *</Label>
                                        <Input placeholder="As per PAN card" value={formData.taxpayer_name} onChange={(e) => updateField('taxpayer_name', e.target.value)} className={errors.taxpayer_name ? 'border-red-500' : ''} />
                                        {errors.taxpayer_name && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.taxpayer_name}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Date of Birth *</Label>
                                            <Input type="date" value={formData.date_of_birth} onChange={(e) => updateField('date_of_birth', e.target.value)} className={errors.date_of_birth ? 'border-red-500' : ''} />
                                            {errors.date_of_birth && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.date_of_birth}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Assessment Year</Label>
                                            <Input value={formData.assessment_year} disabled className="bg-gray-100" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                                        <Info className="h-5 w-5 text-green-600 shrink-0" />
                                        <div className="text-sm text-green-900">
                                            <p className="font-bold">Income from Salary</p>
                                            <p>Enter your salary income details from Form 16</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Basic Salary (₹)</Label>
                                        <Input type="number" placeholder="500000" value={formData.salary_income} onChange={(e) => updateField('salary_income', e.target.value)} step="0.01" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Allowances (HRA, DA, etc.) (₹)</Label>
                                        <Input type="number" placeholder="100000" value={formData.allowances} onChange={(e) => updateField('allowances', e.target.value)} step="0.01" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Perquisites (₹)</Label>
                                        <Input type="number" placeholder="50000" value={formData.perquisites} onChange={(e) => updateField('perquisites', e.target.value)} step="0.01" />
                                    </div>
                                    <div className="bg-gray-50 border-2 rounded-lg p-4">
                                        <p className="text-sm text-gray-600">Total Salary Income</p>
                                        <p className="text-2xl font-bold text-green-600">₹{(parseFloat(formData.salary_income || '0') + parseFloat(formData.allowances || '0') + parseFloat(formData.perquisites || '0')).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex gap-3">
                                        <Info className="h-5 w-5 text-purple-600 shrink-0" />
                                        <div className="text-sm text-purple-900">
                                            <p className="font-bold">Income from House Property</p>
                                            <p>Enter rental income and related expenses</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Annual Rental Income (₹)</Label>
                                        <Input type="number" placeholder="120000" value={formData.rental_income} onChange={(e) => updateField('rental_income', e.target.value)} step="0.01" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Municipal Taxes Paid (₹)</Label>
                                        <Input type="number" placeholder="10000" value={formData.municipal_taxes} onChange={(e) => updateField('municipal_taxes', e.target.value)} step="0.01" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Interest on Home Loan (₹)</Label>
                                        <Input type="number" placeholder="200000" value={formData.interest_on_loan} onChange={(e) => updateField('interest_on_loan', e.target.value)} step="0.01" />
                                        <p className="text-xs text-gray-500">Maximum deduction: ₹2,00,000</p>
                                    </div>
                                </div>
                            )}

                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
                                        <Info className="h-5 w-5 text-orange-600 shrink-0" />
                                        <div className="text-sm text-orange-900">
                                            <p className="font-bold">Income from Other Sources</p>
                                            <p>Interest, dividends, and other income</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Interest Income (₹)</Label>
                                        <Input type="number" placeholder="25000" value={formData.interest_income} onChange={(e) => updateField('interest_income', e.target.value)} step="0.01" />
                                        <p className="text-xs text-gray-500">From savings account, FD, etc.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Other Income (₹)</Label>
                                        <Input type="number" placeholder="10000" value={formData.other_income} onChange={(e) => updateField('other_income', e.target.value)} step="0.01" />
                                    </div>
                                </div>
                            )}

                            {currentStep === 5 && (
                                <div className="space-y-6">
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                                        <Info className="h-5 w-5 text-red-600 shrink-0" />
                                        <div className="text-sm text-red-900">
                                            <p className="font-bold">Deductions under Chapter VI-A</p>
                                            <p>Claim deductions to reduce taxable income</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Section 80C (₹)</Label>
                                        <Input type="number" placeholder="150000" value={formData.deductions_80c} onChange={(e) => updateField('deductions_80c', e.target.value)} className={errors.deductions_80c ? 'border-red-500' : ''} step="0.01" />
                                        {errors.deductions_80c && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.deductions_80c}</p>}
                                        <p className="text-xs text-gray-500">PPF, LIC, ELSS, etc. (Max: ₹1,50,000)</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Section 80D (₹)</Label>
                                        <Input type="number" placeholder="25000" value={formData.deductions_80d} onChange={(e) => updateField('deductions_80d', e.target.value)} className={errors.deductions_80d ? 'border-red-500' : ''} step="0.01" />
                                        {errors.deductions_80d && <p className="text-xs text-red-600"><AlertCircle className="h-3 w-3 inline mr-1" />{errors.deductions_80d}</p>}
                                        <p className="text-xs text-gray-500">Health insurance (Max: ₹25,000)</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-bold">Other Deductions (₹)</Label>
                                        <Input type="number" placeholder="0" value={formData.deductions_other} onChange={(e) => updateField('deductions_other', e.target.value)} step="0.01" />
                                    </div>
                                </div>
                            )}

                            {currentStep === 6 && (
                                <div className="space-y-6">
                                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex gap-3">
                                        <Calculator className="h-5 w-5 text-indigo-600 shrink-0" />
                                        <div className="text-sm text-indigo-900">
                                            <p className="font-bold">Tax Computation</p>
                                            <p>Based on New Tax Regime (FY 2024-25)</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                                            <span className="font-semibold">Gross Total Income</span>
                                            <span className="font-bold">₹{parseFloat(formData.gross_total_income).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                                            <span className="font-semibold">Total Deductions</span>
                                            <span className="font-bold text-green-600">- ₹{parseFloat(formData.total_deductions).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                            <span className="font-bold">Taxable Income</span>
                                            <span className="font-bold text-blue-600">₹{parseFloat(formData.taxable_income).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-2 border-red-200">
                                            <span className="font-bold text-lg">Tax Payable (incl. 4% cess)</span>
                                            <span className="font-bold text-2xl text-red-600">₹{parseFloat(formData.tax_payable).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 border rounded-lg p-4">
                                        <p className="text-xs font-bold text-gray-600 mb-2">Tax Slab Breakdown:</p>
                                        <div className="space-y-1 text-xs text-gray-600">
                                            <p>₹0 - ₹2.5L: Nil</p>
                                            <p>₹2.5L - ₹5L: 5%</p>
                                            <p>₹5L - ₹7.5L: 10%</p>
                                            <p>₹7.5L - ₹10L: 15%</p>
                                            <p>₹10L - ₹12.5L: 20%</p>
                                            <p>₹12.5L - ₹15L: 25%</p>
                                            <p>Above ₹15L: 30%</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 7 && (
                                <div className="space-y-4">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 inline mr-2" />
                                        <span className="font-bold">Review your Income Tax Return</span>
                                    </div>
                                    {[
                                        { title: 'Personal', data: { PAN: formData.pan_number, Name: formData.taxpayer_name, DOB: formData.date_of_birth, AY: formData.assessment_year } },
                                        { title: 'Income', data: { Salary: `₹${(parseFloat(formData.salary_income) + parseFloat(formData.allowances) + parseFloat(formData.perquisites)).toLocaleString('en-IN')}`, 'House Property': `₹${formData.rental_income}`, 'Other Sources': `₹${(parseFloat(formData.interest_income) + parseFloat(formData.other_income)).toLocaleString('en-IN')}`, 'Gross Total': `₹${parseFloat(formData.gross_total_income).toLocaleString('en-IN')}` } },
                                        { title: 'Deductions', data: { '80C': `₹${formData.deductions_80c}`, '80D': `₹${formData.deductions_80d}`, Other: `₹${formData.deductions_other}`, Total: `₹${formData.total_deductions}` } },
                                        { title: 'Tax', data: { 'Taxable Income': `₹${parseFloat(formData.taxable_income).toLocaleString('en-IN')}`, 'Tax Payable': `₹${parseFloat(formData.tax_payable).toLocaleString('en-IN')}` } }
                                    ].map((section, i) => (
                                        <Card key={i} className="border-2">
                                            <CardHeader className="bg-gray-50 pb-3">
                                                <CardTitle className="text-sm flex justify-between">
                                                    <span>{section.title} Details</span>
                                                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(i + 1)}>Edit</Button>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    {Object.entries(section.data).map(([key, val]) => (
                                                        <div key={key}><p className="text-gray-500">{key}</p><p className="font-bold">{val}</p></div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
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
                    <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 px-8">
                        Next<ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 px-8">
                        {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : <><CheckCircle2 className="h-4 w-4 mr-2" />File ITR</>}
                    </Button>
                )}
            </div>
        </div>
    );
}
