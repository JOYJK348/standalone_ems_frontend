"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import HRManagerLayout from "@/components/layout/HRManagerLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  GraduationCap, Mail, Phone, BookOpen, ArrowLeft,
  Loader2, BadgeCheck, Clock, Calendar
} from "lucide-react"
import api from "@/lib/api"

interface Course {
  id: number
  course_name: string
  course_code: string
  course_description: string
  status: string
  duration_hours: number
  tutor_role: string
  is_primary: boolean
}

interface TutorDetail {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  employee_code: string
  department_id: number
  designation_id: number
  is_active: boolean
  date_of_joining: string
  employment_type: string
  courses: Course[]
  courseCount: number
}

export default function TutorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [tutor, setTutor] = useState<TutorDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTutorDetail()
  }, [])

  const fetchTutorDetail = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/ems/hr/tutors/${params.tutorId}`)
      if (res.data.success) {
        setTutor(res.data.data.tutor)
      }
    } catch (err: any) {
      toast.error("Failed to load tutor details")
      router.push("/ems/dynamic-role/hr-manager/tutors")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <HRManagerLayout>
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="ml-3 text-gray-600">Loading tutor details...</span>
          </div>
        </HRManagerLayout>
      </div>
    )
  }

  if (!tutor) return null

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <HRManagerLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="text-gray-600 hover:text-gray-900 -ml-3">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tutors
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-8 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <GraduationCap className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold">{tutor.first_name} {tutor.last_name}</h1>
                    <p className="text-indigo-200 text-sm">{tutor.employee_code}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${tutor.is_active ? 'bg-green-400/20 text-green-200' : 'bg-gray-400/20 text-gray-200'}`}>
                    {tutor.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{tutor.email || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{tutor.phone || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Assigned Courses</p>
                      <p className="text-sm font-medium text-gray-900">{tutor.courseCount}</p>
                    </div>
                  </div>
                  {tutor.date_of_joining && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Date of Joining</p>
                        <p className="text-sm font-medium text-gray-900">{new Date(tutor.date_of_joining).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                  {tutor.employment_type && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Employment Type</p>
                        <p className="text-sm font-medium text-gray-900">{tutor.employment_type}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Assigned Courses</h2>
              <span className="text-sm text-gray-500">{tutor.courseCount} course{tutor.courseCount !== 1 ? 's' : ''}</span>
            </div>

            {tutor.courses.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No courses assigned</p>
                  <p className="text-sm text-gray-400 mt-1">This tutor has not been assigned to any courses yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {tutor.courses.map((course, i) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="border-0 shadow-md hover:shadow-lg transition-all">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-900">{course.course_name}</h3>
                              {course.is_primary && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold uppercase">
                                  <BadgeCheck className="h-3 w-3" />
                                  Primary
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mb-2">{course.course_code}</p>
                            {course.course_description && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{course.course_description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>Role: {course.tutor_role}</span>
                              {course.duration_hours && <span>Duration: {course.duration_hours}h</span>}
                              <span className={`px-2 py-0.5 rounded font-medium uppercase ${
                                course.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                                course.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-600'
                              }`}>{course.status}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </HRManagerLayout>
    </div>
  )
}
