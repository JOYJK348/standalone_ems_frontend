"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { X, Loader2, Percent, IndianRupee } from "lucide-react";
import api from "@/lib/api";

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    student_code: string;
}

interface FeeStructureOption {
    id: number;
    fee_type: string;
    amount: number;
    course_id: number | null;
}

const DISCOUNT_TYPES = [
    { id: "SIBLING", label: "Sibling Discount", defaultPercentage: 10 },
    { id: "MERIT", label: "Merit Scholarship", defaultPercentage: 25 },
    { id: "BULK", label: "Bulk Admission", defaultPercentage: 15 },
    { id: "EARLY_BIRD", label: "Early Bird", defaultPercentage: 5 },
    { id: "CUSTOM", label: "Custom", defaultPercentage: 0 },
];

interface Props {
    studentId?: number;
    feeStructureId?: number;
    invoiceId?: number;
    invoiceAmount?: number;
    onClose: () => void;
    onSave: () => void;
}

export default function DiscountModal({
    studentId: propStudentId,
    feeStructureId,
    invoiceId,
    invoiceAmount,
    onClose,
    onSave,
}: Props) {
    const [students, setStudents] = useState<Student[]>([]);
    const [feeStructures, setFeeStructures] = useState<FeeStructureOption[]>(
        [],
    );
    const [selectedStudent, setSelectedStudent] = useState(
        propStudentId?.toString() || "",
    );
    const [selectedFeeStructure, setSelectedFeeStructure] = useState(
        feeStructureId?.toString() || "",
    );
    const [type, setType] = useState("SIBLING");
    const [percentage, setPercentage] = useState(10);
    const [amount, setAmount] = useState(0);
    const [reason, setReason] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get("/ems/students?limit=500")
            .then((res) => {
                if (res.data.success)
                    setStudents(res.data.data?.data || res.data.data || []);
            })
            .catch(() => {});

        api.get("/ems/fee-installments")
            .then((res) => {
                const data = res.data.data || res.data || [];
                const unique: FeeStructureOption[] = [];
                const seen = new Set<number>();
                for (const item of data) {
                    const fs = item.fee_structure;
                    if (fs && !seen.has(item.fee_structure_id)) {
                        seen.add(item.fee_structure_id);
                        unique.push({
                            id: item.fee_structure_id,
                            fee_type: fs.fee_type,
                            amount: fs.amount,
                            course_id: fs.course_id,
                        });
                    }
                }
                setFeeStructures(unique);
                if (unique.length === 1 && !selectedFeeStructure) {
                    setSelectedFeeStructure(unique[0].id.toString());
                }
            })
            .catch(() => {});
    }, []);

    const handleSave = async () => {
        if (!selectedStudent || !selectedFeeStructure) {
            toast.error("Select student and fee structure");
            return;
        }
        try {
            setSaving(true);
            const discountRes = await api.post("/ems/discounts", {
                student_id: parseInt(selectedStudent),
                fee_structure_id: parseInt(selectedFeeStructure),
                discount_type: type,
                percentage,
                amount: amount || null,
                reason: reason || null,
            });
            if (discountRes.data.success) {
                if (invoiceId && invoiceAmount) {
                    const discountAmount =
                        amount > 0
                            ? amount
                            : (invoiceAmount * percentage) / 100;
                    const finalAmount = invoiceAmount - discountAmount;
                    await api.put(`/ems/invoices?id=${invoiceId}`, {
                        discount_id: discountRes.data.data.id,
                        discount_amount: discountAmount,
                        final_amount: finalAmount,
                    });
                }
                toast.success(
                    `Discount applied! ₹${discountRes.data.data?.id ? "Done" : ""}`,
                );
                onSave();
                onClose();
            }
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message || "Failed to apply discount",
            );
        } finally {
            setSaving(false);
        }
    };

    const selectedDiscountType = DISCOUNT_TYPES.find((d) => d.id === type);

    return (
        <div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                        Apply Discount
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    {!propStudentId && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                Student
                            </label>
                            <select
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
                                value={selectedStudent}
                                onChange={(e) =>
                                    setSelectedStudent(e.target.value)
                                }
                            >
                                <option value="">Select Student</option>
                                {students.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.first_name} {s.last_name} (
                                        {s.student_code})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {!feeStructureId && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                Fee Structure
                            </label>
                            <select
                                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
                                value={selectedFeeStructure}
                                onChange={(e) =>
                                    setSelectedFeeStructure(e.target.value)
                                }
                            >
                                <option value="">Select Fee Structure</option>
                                {feeStructures.map((fs) => (
                                    <option key={fs.id} value={fs.id}>
                                        #{fs.id} — {fs.fee_type} (₹
                                        {Number(fs.amount).toLocaleString()})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            Discount Type
                        </label>
                        <select
                            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
                            value={type}
                            onChange={(e) => {
                                setType(e.target.value);
                                const selected = DISCOUNT_TYPES.find(
                                    (d) => d.id === e.target.value,
                                );
                                setPercentage(selected?.defaultPercentage || 0);
                            }}
                        >
                            {DISCOUNT_TYPES.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                <Percent className="h-3 w-3 inline mr-1" />
                                Percentage
                            </label>
                            <Input
                                type="number"
                                value={percentage}
                                onChange={(e) =>
                                    setPercentage(Number(e.target.value))
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">
                                <IndianRupee className="h-3 w-3 inline mr-1" />
                                Amount
                            </label>
                            <Input
                                type="number"
                                value={amount || ""}
                                onChange={(e) =>
                                    setAmount(Number(e.target.value))
                                }
                                placeholder="Auto or manual"
                            />
                        </div>
                    </div>

                    {selectedDiscountType && (
                        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                            {selectedDiscountType.label}: {percentage}% off
                            {amount > 0 && ` (₹${amount.toLocaleString()})`}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">
                            Reason
                        </label>
                        <textarea
                            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={2}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Why this discount?"
                        />
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Apply Discount
                    </Button>
                </div>
            </div>
        </div>
    );
}
