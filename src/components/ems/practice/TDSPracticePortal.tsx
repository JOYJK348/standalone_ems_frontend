'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    FileText,
    Calculator,
    Building2,
    User,
    CreditCard,
    Calendar,
    Info,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api';

interface TDSFormData {
    // Deductor Details (Section A)
    deductor_tan: string;
    deductor_name: string;
    deductor_pan: string;

    // Deductee Details (Section B)
    deductee_name: string;
    deductee_pan: string;
    deductee_address: string;

    // Payment Details (Section C)
    payment_date: string;
    payment_amount: string;
    nature_of_payment: string;
    section_code: string;

    // TDS Details (Section D)
    tds_rate: string;
    tds_deducted: string;
    tds_deposited: string;
    deposit_date: string;

    // Challan Details (Section E)
    challan_serial_no: string;
    bsr_code: string;
    challan_date: string;
    challan_amount: string;
}

interface TDSPracticePortalProps {
    allocationId: number;
    onSuccess: () => void;
}

const STEPS = [
    { id: 1, title: 'Deductor Details', icon: Building2, section: 'A' },
    { id: 2, title: 'Deductee Details', icon: User, section: 'B' },
    { id: 3, title: 'Payment Details', icon: CreditCard, section: 'C' },
    { id: 4, title: 'TDS Calculation', icon: Calculator, section: 'D' },
    { id: 5, title: 'Challan Details', icon: FileText, section: 'E' },
    { id: 6, title: 'Review & Submit', icon: CheckCircle2, section: 'F' }
];

const NATURE_OF_PAYMENTS = [
    { code: '192A', name: 'Salary - Government' },
    { code: '192B', name: 'Salary - Non-Government' },
    { code: '194A', name: 'Interest other than on securities' },
    { code: '194C', name: 'Payments to contractors' },
    { code: '194H', name: 'Commission or Brokerage' },
    { code: '194J', name: 'Professional or Technical Services' }
];

export function TDSPracticePortal({ allocationId, onSuccess }: TDSPracticePortalProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<TDSFormData>({
        deductor_tan: '',
        deductor_name: '',
        deductor_pan: '',
        deductee_name: '',
        deductee_pan: '',
        deductee_address: '',
        payment_date: '',
        payment_amount: '',
        nature_of_payment: '',
        section_code: '',
        tds_rate: '',
        tds_deducted: '',
        tds_deposited: '',
        deposit_date: '',
        challan_serial_no: '',
        bsr_code: '',
        challan_date: '',
        challan_amount: ''
    });

    // Validation functions
    const validatePAN = (pan: string): boolean => {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return panRegex.test(pan);
    };

    const validateTAN = (tan: string): boolean => {
        const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;
        return tanRegex.test(tan);
    };

    const validateBSR = (bsr: string): boolean => {
        return /^[0-9]{7}$/.test(bsr);
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        switch (step) {
            case 1: // Deductor Details
                if (!formData.deductor_tan) {
                    newErrors.deductor_tan = 'TAN is required';
                } else if (!validateTAN(formData.deductor_tan)) {
                    newErrors.deductor_tan = 'Invalid TAN format (e.g., ABCD12345E)';
                }
                if (!formData.deductor_name) {
                    newErrors.deductor_name = 'Deductor name is required';
                }
                if (!formData.deductor_pan) {
                    newErrors.deductor_pan = 'PAN is required';
                } else if (!validatePAN(formData.deductor_pan)) {
                    newErrors.deductor_pan = 'Invalid PAN format (e.g., ABCDE1234F)';
                }
                break;

            case 2: // Deductee Details
                if (!formData.deductee_name) {
                    newErrors.deductee_name = 'Deductee name is required';
                }
                if (!formData.deductee_pan) {
                    newErrors.deductee_pan = 'PAN is required';
                } else if (!validatePAN(formData.deductee_pan)) {
                    newErrors.deductee_pan = 'Invalid PAN format (e.g., ABCDE1234F)';
                }
                if (!formData.deductee_address) {
                    newErrors.deductee_address = 'Address is required';
                }
                break;

            case 3: // Payment Details
                if (!formData.payment_date) {
                    newErrors.payment_date = 'Payment date is required';
                }
                if (!formData.payment_amount || parseFloat(formData.payment_amount) <= 0) {
                    newErrors.payment_amount = 'Valid payment amount is required';
                }
                if (!formData.nature_of_payment) {
                    newErrors.nature_of_payment = 'Nature of payment is required';
                }
                if (!formData.section_code) {
                    newErrors.section_code = 'Section code is required';
                }
                break;

            case 4: // TDS Calculation
                if (!formData.tds_rate || parseFloat(formData.tds_rate) <= 0) {
                    newErrors.tds_rate = 'Valid TDS rate is required';
                }

                const calculatedTDS = (parseFloat(formData.payment_amount || '0') * parseFloat(formData.tds_rate || '0')) / 100;
                if (Math.abs(parseFloat(formData.tds_deducted || '0') - calculatedTDS) > 1) {
                    newErrors.tds_deducted = `TDS should be ₹${calculatedTDS.toFixed(2)} (${formData.tds_rate}% of ₹${formData.payment_amount})`;
                }

                if (!formData.tds_deposited) {
                    newErrors.tds_deposited = 'TDS deposited amount is required';
                }
                if (!formData.deposit_date) {
                    newErrors.deposit_date = 'Deposit date is required';
                }
                break;

            case 5: // Challan Details
                if (!formData.challan_serial_no) {
                    newErrors.challan_serial_no = 'Challan serial number is required';
                }
                if (!formData.bsr_code) {
                    newErrors.bsr_code = 'BSR code is required';
                } else if (!validateBSR(formData.bsr_code)) {
                    newErrors.bsr_code = 'BSR code must be 7 digits';
                }
                if (!formData.challan_date) {
                    newErrors.challan_date = 'Challan date is required';
                }
                if (!formData.challan_amount || parseFloat(formData.challan_amount) <= 0) {
                    newErrors.challan_amount = 'Valid challan amount is required';
                }

                // Validate challan amount matches TDS deposited
                if (Math.abs(parseFloat(formData.challan_amount || '0') - parseFloat(formData.tds_deposited || '0')) > 1) {
                    newErrors.challan_amount = `Challan amount should match TDS deposited (₹${formData.tds_deposited})`;
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
            toast.error('Please fix the errors before proceeding');
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(5)) {
            toast.error('Please fix all errors before submitting');
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post('/ems/practice/student/tds/entry', {
                allocationId,
                ...formData,
                payment_amount: parseFloat(formData.payment_amount),
                tds_rate: parseFloat(formData.tds_rate),
                tds_deducted: parseFloat(formData.tds_deducted),
                tds_deposited: parseFloat(formData.tds_deposited),
                challan_amount: parseFloat(formData.challan_amount)
            });

            if (response.data.success) {
                toast.success('TDS Return submitted successfully!');
                onSuccess();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const updateField = (field: keyof TDSFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Auto-calculate TDS when amount or rate changes
        if (field === 'payment_amount' || field === 'tds_rate') {
            const amount = field === 'payment_amount' ? parseFloat(value || '0') : parseFloat(formData.payment_amount || '0');
            const rate = field === 'tds_rate' ? parseFloat(value || '0') : parseFloat(formData.tds_rate || '0');
            const calculatedTDS = (amount * rate) / 100;
            setFormData(prev => ({
                ...prev,
                [field]: value,
                tds_deducted: calculatedTDS.toFixed(2),
                tds_deposited: calculatedTDS.toFixed(2),
                challan_amount: calculatedTDS.toFixed(2)
            }));
        }

        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

    return (
        <div className="space-y-6">
            {/* Progress Bar */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest opacity-80">Form 26Q - TDS on Salary</p>
                            <h3 className="text-xl font-bold">Step {currentStep} of {STEPS.length}</h3>
                        </div>
                        <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                            {Math.round(progress)}% Complete
                        </Badge>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                        <motion.div
                            className="bg-white h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Step Indicators */}
            <div className="flex justify-between">
                {STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = currentStep > step.id;
                    const isCurrent = currentStep === step.id;

                    return (
                        <div key={step.id} className="flex flex-col items-center flex-1">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-green-500 text-white' :
                                    isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-200' :
                                        'bg-gray-200 text-gray-400'
                                }`}>
                                {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                            </div>
                            <p className={`text-xs mt-2 font-bold text-center ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                                Section {step.section}
                            </p>
                            <p className="text-[10px] text-gray-400 text-center hidden sm:block">{step.title}</p>
                        </div>
                    );
                })}
            </div>

            {/* Form Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="border-0 shadow-xl">
                        <CardHeader className="bg-gray-50 border-b">
                            <CardTitle className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    {(() => {
                                        const Icon = STEPS[currentStep - 1].icon;
                                        return <Icon className="h-5 w-5 text-blue-600" />;
                                    })()}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-normal">Section {STEPS[currentStep - 1].section}</p>
                                    <p className="text-lg">{STEPS[currentStep - 1].title}</p>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            {/* Step 1: Deductor Details */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                                        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                        <div className="text-sm text-blue-900">
                                            <p className="font-bold mb-1">About Deductor</p>
                                            <p>The deductor is the person/organization responsible for deducting TDS and depositing it to the government.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">TAN (Tax Deduction Account Number) *</Label>
                                            <Input
                                                placeholder="e.g., ABCD12345E"
                                                value={formData.deductor_tan}
                                                onChange={(e) => updateField('deductor_tan', e.target.value.toUpperCase())}
                                                className={`font-mono ${errors.deductor_tan ? 'border-red-500' : ''}`}
                                                maxLength={10}
                                            />
                                            {errors.deductor_tan && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.deductor_tan}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">Format: 4 letters + 5 digits + 1 letter</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Deductor Name *</Label>
                                            <Input
                                                placeholder="e.g., ABC Private Limited"
                                                value={formData.deductor_name}
                                                onChange={(e) => updateField('deductor_name', e.target.value)}
                                                className={errors.deductor_name ? 'border-red-500' : ''}
                                            />
                                            {errors.deductor_name && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.deductor_name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-sm font-bold">Deductor PAN *</Label>
                                            <Input
                                                placeholder="e.g., ABCDE1234F"
                                                value={formData.deductor_pan}
                                                onChange={(e) => updateField('deductor_pan', e.target.value.toUpperCase())}
                                                className={`font-mono ${errors.deductor_pan ? 'border-red-500' : ''}`}
                                                maxLength={10}
                                            />
                                            {errors.deductor_pan && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.deductor_pan}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">Format: 5 letters + 4 digits + 1 letter</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Deductee Details */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                                        <Info className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                        <div className="text-sm text-green-900">
                                            <p className="font-bold mb-1">About Deductee</p>
                                            <p>The deductee is the person receiving the payment from which TDS is being deducted.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Deductee Name *</Label>
                                            <Input
                                                placeholder="e.g., Rajesh Kumar"
                                                value={formData.deductee_name}
                                                onChange={(e) => updateField('deductee_name', e.target.value)}
                                                className={errors.deductee_name ? 'border-red-500' : ''}
                                            />
                                            {errors.deductee_name && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.deductee_name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Deductee PAN *</Label>
                                            <Input
                                                placeholder="e.g., ABCDE1234F"
                                                value={formData.deductee_pan}
                                                onChange={(e) => updateField('deductee_pan', e.target.value.toUpperCase())}
                                                className={`font-mono ${errors.deductee_pan ? 'border-red-500' : ''}`}
                                                maxLength={10}
                                            />
                                            {errors.deductee_pan && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.deductee_pan}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">Format: 5 letters + 4 digits + 1 letter</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Deductee Address *</Label>
                                            <textarea
                                                placeholder="Enter complete address"
                                                value={formData.deductee_address}
                                                onChange={(e) => updateField('deductee_address', e.target.value)}
                                                className={`w-full min-h-[100px] px-3 py-2 border rounded-md ${errors.deductee_address ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            {errors.deductee_address && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.deductee_address}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Payment Details */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex gap-3">
                                        <Info className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                                        <div className="text-sm text-purple-900">
                                            <p className="font-bold mb-1">Payment Information</p>
                                            <p>Enter details of the payment made to the deductee on which TDS is applicable.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Payment Date *</Label>
                                            <Input
                                                type="date"
                                                value={formData.payment_date}
                                                onChange={(e) => updateField('payment_date', e.target.value)}
                                                className={errors.payment_date ? 'border-red-500' : ''}
                                            />
                                            {errors.payment_date && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.payment_date}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Payment Amount (₹) *</Label>
                                            <Input
                                                type="number"
                                                placeholder="e.g., 50000"
                                                value={formData.payment_amount}
                                                onChange={(e) => updateField('payment_amount', e.target.value)}
                                                className={errors.payment_amount ? 'border-red-500' : ''}
                                                min="0"
                                                step="0.01"
                                            />
                                            {errors.payment_amount && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.payment_amount}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-sm font-bold">Nature of Payment *</Label>
                                            <select
                                                value={formData.nature_of_payment}
                                                onChange={(e) => {
                                                    const selected = NATURE_OF_PAYMENTS.find(p => p.name === e.target.value);
                                                    updateField('nature_of_payment', e.target.value);
                                                    if (selected) {
                                                        updateField('section_code', selected.code);
                                                    }
                                                }}
                                                className={`w-full h-10 px-3 border rounded-md ${errors.nature_of_payment ? 'border-red-500' : 'border-gray-300'}`}
                                            >
                                                <option value="">-- Select Nature of Payment --</option>
                                                {NATURE_OF_PAYMENTS.map(payment => (
                                                    <option key={payment.code} value={payment.name}>
                                                        {payment.code} - {payment.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.nature_of_payment && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.nature_of_payment}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label className="text-sm font-bold">Section Code *</Label>
                                            <Input
                                                value={formData.section_code}
                                                disabled
                                                className="bg-gray-100 font-mono"
                                            />
                                            <p className="text-xs text-gray-500">Auto-filled based on nature of payment</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: TDS Calculation */}
                            {currentStep === 4 && (
                                <div className="space-y-6">
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
                                        <Info className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                                        <div className="text-sm text-orange-900">
                                            <p className="font-bold mb-1">TDS Calculation</p>
                                            <p>Enter the TDS rate and verify the calculated TDS amount. The system will auto-calculate based on payment amount.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">TDS Rate (%) *</Label>
                                            <select
                                                value={formData.tds_rate}
                                                onChange={(e) => updateField('tds_rate', e.target.value)}
                                                className={`w-full h-10 px-3 border rounded-md ${errors.tds_rate ? 'border-red-500' : 'border-gray-300'}`}
                                            >
                                                <option value="">-- Select TDS Rate --</option>
                                                <option value="1">1%</option>
                                                <option value="2">2%</option>
                                                <option value="5">5%</option>
                                                <option value="10">10%</option>
                                                <option value="20">20%</option>
                                            </select>
                                            {errors.tds_rate && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.tds_rate}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">TDS Deducted (₹) *</Label>
                                            <Input
                                                type="number"
                                                value={formData.tds_deducted}
                                                onChange={(e) => updateField('tds_deducted', e.target.value)}
                                                className={`font-mono ${errors.tds_deducted ? 'border-red-500' : ''}`}
                                                step="0.01"
                                            />
                                            {errors.tds_deducted && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.tds_deducted}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">Auto-calculated: {formData.tds_rate}% of ₹{formData.payment_amount}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">TDS Deposited (₹) *</Label>
                                            <Input
                                                type="number"
                                                value={formData.tds_deposited}
                                                onChange={(e) => updateField('tds_deposited', e.target.value)}
                                                className={`font-mono ${errors.tds_deposited ? 'border-red-500' : ''}`}
                                                step="0.01"
                                            />
                                            {errors.tds_deposited && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.tds_deposited}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Deposit Date *</Label>
                                            <Input
                                                type="date"
                                                value={formData.deposit_date}
                                                onChange={(e) => updateField('deposit_date', e.target.value)}
                                                className={errors.deposit_date ? 'border-red-500' : ''}
                                            />
                                            {errors.deposit_date && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.deposit_date}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">TDS must be deposited by 7th of next month</p>
                                        </div>
                                    </div>

                                    {/* Calculation Summary */}
                                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
                                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Calculator className="h-5 w-5" />
                                            Calculation Summary
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">Payment Amount</p>
                                                <p className="font-bold text-lg">₹{parseFloat(formData.payment_amount || '0').toLocaleString('en-IN')}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">TDS Rate</p>
                                                <p className="font-bold text-lg">{formData.tds_rate}%</p>
                                            </div>
                                            <div className="col-span-2 border-t pt-4">
                                                <p className="text-gray-500">Total TDS Deducted</p>
                                                <p className="font-bold text-2xl text-orange-600">₹{parseFloat(formData.tds_deducted || '0').toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Challan Details */}
                            {currentStep === 5 && (
                                <div className="space-y-6">
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                                        <Info className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                        <div className="text-sm text-red-900">
                                            <p className="font-bold mb-1">Challan Details</p>
                                            <p>Enter the details of the challan used to deposit TDS to the government. This information is crucial for TDS credit.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Challan Serial Number *</Label>
                                            <Input
                                                placeholder="e.g., 12345"
                                                value={formData.challan_serial_no}
                                                onChange={(e) => updateField('challan_serial_no', e.target.value)}
                                                className={`font-mono ${errors.challan_serial_no ? 'border-red-500' : ''}`}
                                            />
                                            {errors.challan_serial_no && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.challan_serial_no}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">BSR Code *</Label>
                                            <Input
                                                placeholder="e.g., 0123456"
                                                value={formData.bsr_code}
                                                onChange={(e) => updateField('bsr_code', e.target.value)}
                                                className={`font-mono ${errors.bsr_code ? 'border-red-500' : ''}`}
                                                maxLength={7}
                                            />
                                            {errors.bsr_code && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.bsr_code}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">7-digit BSR code of the bank branch</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Challan Date *</Label>
                                            <Input
                                                type="date"
                                                value={formData.challan_date}
                                                onChange={(e) => updateField('challan_date', e.target.value)}
                                                className={errors.challan_date ? 'border-red-500' : ''}
                                            />
                                            {errors.challan_date && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.challan_date}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold">Challan Amount (₹) *</Label>
                                            <Input
                                                type="number"
                                                value={formData.challan_amount}
                                                onChange={(e) => updateField('challan_amount', e.target.value)}
                                                className={`font-mono ${errors.challan_amount ? 'border-red-500' : ''}`}
                                                step="0.01"
                                            />
                                            {errors.challan_amount && (
                                                <p className="text-xs text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    {errors.challan_amount}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">Should match TDS deposited amount</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 6: Review & Submit */}
                            {currentStep === 6 && (
                                <div className="space-y-6">
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                                        <div className="text-sm text-green-900">
                                            <p className="font-bold mb-1">Review Your Submission</p>
                                            <p>Please review all the details carefully before submitting. You can go back to any section to make changes.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Section A */}
                                        <Card className="border-2">
                                            <CardHeader className="bg-gray-50 pb-3">
                                                <CardTitle className="text-sm flex items-center justify-between">
                                                    <span>Section A: Deductor Details</span>
                                                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                                                        Edit
                                                    </Button>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-500">TAN</p>
                                                        <p className="font-mono font-bold">{formData.deductor_tan}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Name</p>
                                                        <p className="font-bold">{formData.deductor_name}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <p className="text-gray-500">PAN</p>
                                                        <p className="font-mono font-bold">{formData.deductor_pan}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Section B */}
                                        <Card className="border-2">
                                            <CardHeader className="bg-gray-50 pb-3">
                                                <CardTitle className="text-sm flex items-center justify-between">
                                                    <span>Section B: Deductee Details</span>
                                                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
                                                        Edit
                                                    </Button>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-500">Name</p>
                                                        <p className="font-bold">{formData.deductee_name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">PAN</p>
                                                        <p className="font-mono font-bold">{formData.deductee_pan}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <p className="text-gray-500">Address</p>
                                                        <p className="font-bold">{formData.deductee_address}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Section C */}
                                        <Card className="border-2">
                                            <CardHeader className="bg-gray-50 pb-3">
                                                <CardTitle className="text-sm flex items-center justify-between">
                                                    <span>Section C: Payment Details</span>
                                                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)}>
                                                        Edit
                                                    </Button>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-500">Payment Date</p>
                                                        <p className="font-bold">{formData.payment_date}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Amount</p>
                                                        <p className="font-bold">₹{parseFloat(formData.payment_amount).toLocaleString('en-IN')}</p>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <p className="text-gray-500">Nature of Payment</p>
                                                        <p className="font-bold">{formData.section_code} - {formData.nature_of_payment}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Section D */}
                                        <Card className="border-2">
                                            <CardHeader className="bg-gray-50 pb-3">
                                                <CardTitle className="text-sm flex items-center justify-between">
                                                    <span>Section D: TDS Calculation</span>
                                                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(4)}>
                                                        Edit
                                                    </Button>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-500">TDS Rate</p>
                                                        <p className="font-bold">{formData.tds_rate}%</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">TDS Deducted</p>
                                                        <p className="font-bold text-orange-600">₹{parseFloat(formData.tds_deducted).toLocaleString('en-IN')}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">TDS Deposited</p>
                                                        <p className="font-bold">₹{parseFloat(formData.tds_deposited).toLocaleString('en-IN')}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Deposit Date</p>
                                                        <p className="font-bold">{formData.deposit_date}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Section E */}
                                        <Card className="border-2">
                                            <CardHeader className="bg-gray-50 pb-3">
                                                <CardTitle className="text-sm flex items-center justify-between">
                                                    <span>Section E: Challan Details</span>
                                                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(5)}>
                                                        Edit
                                                    </Button>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-4">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-500">Challan Serial No</p>
                                                        <p className="font-mono font-bold">{formData.challan_serial_no}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">BSR Code</p>
                                                        <p className="font-mono font-bold">{formData.bsr_code}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Challan Date</p>
                                                        <p className="font-bold">{formData.challan_date}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Challan Amount</p>
                                                        <p className="font-bold">₹{parseFloat(formData.challan_amount).toLocaleString('en-IN')}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between gap-4">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    className="px-8"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                </Button>

                {currentStep < STEPS.length ? (
                    <Button
                        onClick={handleNext}
                        className="bg-blue-600 hover:bg-blue-700 px-8"
                    >
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-green-600 hover:bg-green-700 px-8"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Submit TDS Return
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}
