"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Activity, Zap, Droplets, Calendar, MapPin, User, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useAppSelector } from "@/lib/hooks"
import { formatDate } from "@/lib/localization"

export default function MeterReadingsPage() {
  const { currentUser } = useAppSelector((state) => state.users)
  const [selectedUnit, setSelectedUnit] = useState<any>(null)
  const [readingData, setReadingData] = useState({
    date: new Date().toISOString().split("T")[0],
    meterType: "",
    currentReading: "",
    notes: "",
  })

  const isCaretaker = currentUser?.role === "caretaker"

  // Mock data for caretaker's assigned units
  const assignedUnits = [
    {
      id: 1,
      unitName: "Unit A1",
      unitAddress: "Sunset Apartments - Unit A1",
      propertyName: "Sunset Apartments",
      tenantName: "Kofi Mensah",
      tenantPhone: "+233 20 111 2222",
      status: "occupied",
      lastElectricityReading: {
        reading: 1245,
        date: "2024-02-10",
        meterNumber: "ELE-001-A1",
      },
      lastWaterReading: {
        reading: 2847,
        date: "2024-02-08",
        meterNumber: "WAT-001-A1",
      },
    },
    {
      id: 2,
      unitName: "Unit A2",
      unitAddress: "Sunset Apartments - Unit A2",
      propertyName: "Sunset Apartments",
      tenantName: "Ama Serwaa",
      tenantPhone: "+233 24 333 4444",
      status: "occupied",
      lastElectricityReading: {
        reading: 987,
        date: "2024-02-12",
        meterNumber: "ELE-001-A2",
      },
      lastWaterReading: {
        reading: 1523,
        date: "2024-02-11",
        meterNumber: "WAT-001-A2",
      },
    },
    {
      id: 3,
      unitName: "Unit A4",
      unitAddress: "Sunset Apartments - Unit A4",
      propertyName: "Sunset Apartments",
      tenantName: "Yaw Osei",
      tenantPhone: "+233 26 555 6666",
      status: "occupied",
      lastElectricityReading: {
        reading: 1567,
        date: "2024-02-09",
        meterNumber: "ELE-001-A4",
      },
      lastWaterReading: {
        reading: 3421,
        date: "2024-02-07",
        meterNumber: "WAT-001-A4",
      },
    },
    {
      id: 4,
      unitName: "Unit B1",
      unitAddress: "Golden Heights - Unit B1",
      propertyName: "Golden Heights",
      tenantName: "Kwaku Boateng",
      tenantPhone: "+233 20 777 8888",
      status: "occupied",
      lastElectricityReading: {
        reading: 2134,
        date: "2024-02-11",
        meterNumber: "ELE-002-B1",
      },
      lastWaterReading: {
        reading: 1876,
        date: "2024-02-10",
        meterNumber: "WAT-002-B1",
      },
    },
    {
      id: 5,
      unitName: "Unit B3",
      unitAddress: "Golden Heights - Unit B3",
      propertyName: "Golden Heights",
      tenantName: "Efua Asante",
      tenantPhone: "+233 24 999 0000",
      status: "occupied",
      lastElectricityReading: {
        reading: 876,
        date: "2024-02-13",
        meterNumber: "ELE-002-B3",
      },
      lastWaterReading: {
        reading: 2198,
        date: "2024-02-12",
        meterNumber: "WAT-002-B3",
      },
    },
    {
      id: 6,
      unitName: "Unit B4",
      unitAddress: "Golden Heights - Unit B4",
      propertyName: "Golden Heights",
      tenantName: "Kojo Antwi",
      tenantPhone: "+233 26 111 2222",
      status: "occupied",
      lastElectricityReading: {
        reading: 1432,
        date: "2024-02-08",
        meterNumber: "ELE-002-B4",
      },
      lastWaterReading: {
        reading: 2765,
        date: "2024-02-06",
        meterNumber: "WAT-002-B4",
      },
    },
  ]

  const recentReadings = [
    {
      id: 1,
      unitName: "Unit A1",
      meterType: "Electricity",
      reading: 1245,
      date: "2024-02-15",
      status: "submitted",
      notes: "Meter number ELE-001-A1, reading clear",
    },
    {
      id: 2,
      unitName: "Unit B3",
      meterType: "Water",
      reading: 2198,
      date: "2024-02-15",
      status: "submitted",
      notes: "Meter number WAT-002-B3",
    },
    {
      id: 3,
      unitName: "Unit A2",
      meterType: "Electricity",
      reading: 987,
      date: "2024-02-14",
      status: "reviewed",
      notes: "Meter number ELE-001-A2, tenant present during reading",
    },
  ]

  const handleSubmitReading = () => {
    if (selectedUnit && readingData.meterType && readingData.currentReading) {
      console.log("[v0] Submitting meter reading:", {
        unit: selectedUnit,
        ...readingData,
      })

      // Reset form
      setSelectedUnit(null)
      setReadingData({
        date: new Date().toISOString().split("T")[0],
        meterType: "",
        currentReading: "",
        notes: "",
      })

      alert("Meter reading submitted successfully! The landlord will review and process for invoicing.")
    }
  }

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getReadingStatus = (lastReadingDate: string) => {
    const daysAgo = getDaysAgo(lastReadingDate)
    if (daysAgo <= 7) return { status: "recent", color: "green", text: `${daysAgo} days ago` }
    if (daysAgo <= 14) return { status: "due", color: "yellow", text: `${daysAgo} days ago` }
    return { status: "overdue", color: "red", text: `${daysAgo} days ago` }
  }

  if (!isCaretaker) {
    return (
      <MainLayout>
        <div className="p-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">This page is only accessible to caretakers.</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="animate-in fade-in-0 slide-in-from-top-4 duration-500">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
            Meter Readings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Submit utility meter readings for occupied units in your assigned properties.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AnimatedCard delay={100} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Occupied Units</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{assignedUnits.length}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Require readings</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900 dark:to-cyan-900 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={200} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Readings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {recentReadings.filter((r) => getDaysAgo(r.date) <= 7).length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">This week</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={300} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Due Soon</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {
                      assignedUnits.filter((unit) => {
                        const elecDays = getDaysAgo(unit.lastElectricityReading.date)
                        const waterDays = getDaysAgo(unit.lastWaterReading.date)
                        return elecDays > 7 || waterDays > 7
                      }).length
                    }
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Need attention</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={400} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Submitted Today</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {recentReadings.filter((r) => r.date === new Date().toISOString().split("T")[0]).length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Readings logged</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit New Reading */}
          <AnimatedCard delay={500} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Submit Meter Reading
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="unit-select">Select Unit *</Label>
                <Select
                  value={selectedUnit?.id?.toString() || ""}
                  onValueChange={(value) => {
                    const unit = assignedUnits.find((u) => u.id.toString() === value)
                    setSelectedUnit(unit)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a unit to record reading" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id.toString()}>
                        {unit.unitAddress} - {unit.tenantName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedUnit && (
                <>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-gray-900 dark:text-white">{selectedUnit.tenantName}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUnit.unitAddress}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUnit.tenantPhone}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm font-medium">Last Electricity</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedUnit.lastElectricityReading.reading} kWh
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {getReadingStatus(selectedUnit.lastElectricityReading.date).text}
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Droplets className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium">Last Water</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedUnit.lastWaterReading.reading} gal
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {getReadingStatus(selectedUnit.lastWaterReading.date).text}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reading-date">Reading Date *</Label>
                    <Input
                      id="reading-date"
                      type="date"
                      value={readingData.date}
                      onChange={(e) => setReadingData({ ...readingData, date: e.target.value })}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="meter-type">Meter Type *</Label>
                    <Select
                      value={readingData.meterType}
                      onValueChange={(value) => setReadingData({ ...readingData, meterType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select meter type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electricity">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-600" />
                            Electricity
                          </div>
                        </SelectItem>
                        <SelectItem value="water">
                          <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-blue-600" />
                            Water
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="current-reading">Current Reading *</Label>
                    <Input
                      id="current-reading"
                      type="number"
                      placeholder={
                        readingData.meterType === "electricity" ? "Enter kWh reading" : "Enter gallons reading"
                      }
                      value={readingData.currentReading}
                      onChange={(e) => setReadingData({ ...readingData, currentReading: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="e.g., Meter number ABC123, tenant present during reading"
                      value={readingData.notes}
                      onChange={(e) => setReadingData({ ...readingData, notes: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <Button
                    onClick={handleSubmitReading}
                    disabled={!readingData.meterType || !readingData.currentReading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700"
                  >
                    Submit Reading
                  </Button>
                </>
              )}
            </CardContent>
          </AnimatedCard>

          {/* Recent Readings */}
          <AnimatedCard delay={600} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                Recent Submissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentReadings.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No recent readings submitted</p>
                </div>
              ) : (
                recentReadings.map((reading) => (
                  <div key={reading.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {reading.meterType === "Electricity" ? (
                          <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        ) : (
                          <Droplets className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        )}
                        <span className="font-medium text-gray-900 dark:text-white">{reading.unitName}</span>
                      </div>
                      <Badge
                        variant={reading.status === "reviewed" ? "default" : "secondary"}
                        className={
                          reading.status === "reviewed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {reading.status === "submitted" ? "Pending Review" : "Reviewed"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Type:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{reading.meterType}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Reading:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {reading.reading} {reading.meterType === "Electricity" ? "kWh" : "gal"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Date:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{formatDate(reading.date)}</span>
                      </div>
                    </div>
                    {reading.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">{reading.notes}</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Units Overview */}
        <AnimatedCard delay={700} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Units Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedUnits.map((unit) => {
                const elecStatus = getReadingStatus(unit.lastElectricityReading.date)
                const waterStatus = getReadingStatus(unit.lastWaterReading.date)

                return (
                  <div key={unit.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">{unit.unitName}</h4>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Occupied
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">{unit.tenantName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">{unit.propertyName}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div
                        className={`p-2 rounded text-xs ${
                          elecStatus.color === "green"
                            ? "bg-green-50 text-green-700"
                            : elecStatus.color === "yellow"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          <span>Electricity</span>
                        </div>
                        <p className="font-medium">{unit.lastElectricityReading.reading} kWh</p>
                        <p>{elecStatus.text}</p>
                      </div>

                      <div
                        className={`p-2 rounded text-xs ${
                          waterStatus.color === "green"
                            ? "bg-green-50 text-green-700"
                            : waterStatus.color === "yellow"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <Droplets className="h-3 w-3" />
                          <span>Water</span>
                        </div>
                        <p className="font-medium">{unit.lastWaterReading.reading} gal</p>
                        <p>{waterStatus.text}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </AnimatedCard>
      </div>
    </MainLayout>
  )
}
