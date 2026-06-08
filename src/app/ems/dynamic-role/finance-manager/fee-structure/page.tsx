"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import FinanceManagerLayout from "@/components/layout/FinanceManagerLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Plus, Loader2, X, CheckCircle, AlertTriangle, Save, Trash2
} from "lucide-react"
import api from "@/lib/api"

interface Course {
  id: number
  course_name: string
  course_code: string
}

interface Installment {
  installment_no: number
  amount: number
  due_date: string
}

const FEE_TYPES = ['TUITION', 'REGISTRATION', 'MATERIAL', 'EXAM']

export default function FeeStructurePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [courseId, setCourseId] = useState("")
  const [feeType, setFeeType] = useState('TUITION')
  const [feeName, setFeeName] = useState("")
  const [totalAmount, setTotalAmount] = useState(50000)
  const [installments, setInstallments] = useState<Installment[]>([
    { installment_no: 1, amount: 0, due_date: "" },
    { installment_no: 2, amount: 0, due_date: "" },
    { installment_no: 3, amount: 0, due_date: "" }
  ])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/ems/courses?limit=200')
      .then(res => {
        if (res.data.success) setCourses(res.data.data?.courses || res.data.data?.data || [])
      })
      .catch(() => {})
  }, [])

  const addInstallment = () => {
    setInstallments([...installments, { installment_no: installments.length + 1, amount: 0, due_date: "" }])
  }

  const removeInstallment = (index: number) => {
    if (installments.length <= 1) return
    const updated = installments.filter((_, i) => i !== index).map((inst, i) => ({ ...inst, installment_no: i + 1 }))
    setInstallments(updated)
  }

  const updateInstallment = (index: number, field: keyof Installment, value: any) => {
    const updated = [...installments]
    ;(updated[index] as any)[field] = value
    setInstallments(updated)
  }

  const installmentTotal = installments.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
  const isBalanced = installmentTotal === Number(totalAmount)

  const handleSave = async () => {
    if (!courseId || !feeName || !totalAmount) {
      toast.error("Course, fee name, and total amount are required")
      return
    }
    if (!isBalanced) {
      toast.error("Installment total must match fee amount")
      return
    }
    try {
      setSaving(true)
      const feeRes = await api.post("/ems/fees", {
        course_id: parseInt(courseId),
        fee_name: feeName,
        fee_type: feeType,
        amount: parseFloat(totalAmount.toString()),
        is_mandatory: true
      })
      if (!feeRes.data.success) throw new Error(feeRes.data.message)

      const feeStructureId = feeRes.data.data.id

      const instRes = await api.post("/ems/fee-installments", {
        fee_structure_id: feeStructureId,
        installments: installments.map(inst => ({
          installment_no: inst.installment_no,
          amount: Number(inst.amount),
          due_date: inst.due_date
        }))
      })
      if (instRes.data.success) {
        toast.success("Fee structure with installments created!")
        setCourseId("")
        setFeeName("")
        setTotalAmount(50000)
        setInstallments([
          { installment_no: 1, amount: 0, due_date: "" },
          { installment_no: 2, amount: 0, due_date: "" },
          { installment_no: 3, amount: 0, due_date: "" }
        ])
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save fee structure")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <FinanceManagerLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fee Structure + Installments</h1>
            <p className="text-sm text-gray-500 mt-1">Create fee plans with installment tracking</p>
          </motion.div>

          <Card className="border-0 shadow-sm mb-6">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Course</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={courseId}
                    onChange={e => setCourseId(e.target.value)}
                  >
                    <option value="">Select Course</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.course_name} ({c.course_code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Fee Type</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm"
                    value={feeType}
                    onChange={e => setFeeType(e.target.value)}
                  >
                    {FEE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Fee Name</label>
                <Input type="text" placeholder="e.g. NEET Course Fee" value={feeName} onChange={e => setFeeName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Total Amount (₹)</label>
                <Input type="number" value={totalAmount} onChange={e => setTotalAmount(Number(e.target.value))} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Installments</h3>
                <Button variant="outline" size="sm" onClick={addInstallment}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>

              <div className="space-y-3">
                {installments.map((inst, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm font-bold text-gray-500 w-8">#{inst.installment_no}</span>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={inst.amount || ''}
                        onChange={e => updateInstallment(i, 'amount', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="date"
                        value={inst.due_date}
                        onChange={e => updateInstallment(i, 'due_date', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <button onClick={() => removeInstallment(i)} className="p-2 hover:bg-red-50 rounded-lg">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>

              <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${isBalanced ? 'bg-green-50' : 'bg-red-50'}`}>
                {isBalanced ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <span className={`text-sm font-medium ${isBalanced ? 'text-green-700' : 'text-red-700'}`}>
                  Total: ₹{installmentTotal.toLocaleString()} / ₹{Number(totalAmount).toLocaleString()}
                  {isBalanced ? ' ✓ Balanced' : ' ✗ Mismatch'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 py-3">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Fee Structure with Installments
          </Button>

          <p className="text-xs text-gray-400 mt-2 text-center">
            This will create the fee structure and all installments at once
          </p>
        </div>
      </FinanceManagerLayout>
    </div>
  )
}
