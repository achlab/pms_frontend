"use client"

import { useState } from "react"
import { MainLayout } from "@/components/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/animated-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  Phone,
  Mail,
  CreditCard,
  Plus,
  MoreHorizontal,
  UserCheck,
  UserX,
  Eye,
  Edit,
  LogIn,
  Settings,
} from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { updateUser, createUser } from "@/lib/slices/usersSlice"
import { formatGhanaPhone } from "@/lib/localization"

export default function AdminUsersPage() {
  const dispatch = useAppDispatch()
  const users = [] // TODO: Implement with super admin user service

  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [regionFilter, setRegionFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showEditUser, setShowEditUser] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "landlord",
    ghanaCardId: "",
    region: "",
    status: "active",
  })

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchTerm === "" ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.ghanaCardId && user.ghanaCardId.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesRegion = regionFilter === "all" || user.region === regionFilter

    return matchesSearch && matchesRole && matchesStatus && matchesRegion
  })

  const handleApproveUser = (userId: number) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      dispatch(updateUser({ ...user, status: "active" }))
    }
  }

  const handleRejectUser = (userId: number) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      dispatch(updateUser({ ...user, status: "inactive" }))
    }
  }

  const handleDeactivateUser = (userId: number) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      dispatch(updateUser({ ...user, status: "inactive" }))
    }
  }

  const handleReactivateUser = (userId: number) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      dispatch(updateUser({ ...user, status: "active" }))
    }
  }

  const handleImpersonateUser = (userId: number) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      // In a real app, this would switch the current user context
      alert(`Impersonating ${user.name}. This would redirect to their dashboard.`)
    }
  }

  const handleCreateUser = () => {
    const userToCreate = {
      ...newUser,
      id: Date.now(), // In real app, this would be handled by backend
      createdAt: new Date().toISOString(),
    }
    dispatch(createUser(userToCreate))
    setNewUser({
      name: "",
      email: "",
      phone: "",
      role: "landlord",
      ghanaCardId: "",
      region: "",
      status: "active",
    })
    setShowCreateUser(false)
  }

  const handleEditUser = () => {
    if (editingUser) {
      dispatch(updateUser(editingUser))
      setShowEditUser(false)
      setEditingUser(null)
    }
  }

  const pendingUsers = users.filter((u) => u.status === "pending_approval")
  const activeUsers = users.filter((u) => u.status === "active")
  const totalLandlords = users.filter((u) => u.role === "landlord").length
  const totalTenants = users.filter((u) => u.role === "tenant").length
  const totalCaretakers = users.filter((u) => u.role === "caretaker").length

  const ghanaRegions = [
    "Greater Accra",
    "Ashanti",
    "Western",
    "Central",
    "Eastern",
    "Northern",
    "Upper East",
    "Upper West",
    "Volta",
    "Brong-Ahafo",
  ]

  return (
    <MainLayout>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start animate-in fade-in-0 slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage user registrations, approvals, and system access across the platform.
            </p>
          </div>
          <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600">
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-gray-700 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">Create New User</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-300">
                  Manually create a new user account for the platform.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Enter full name"
                      className="border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="Enter email address"
                      className="border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      placeholder="+233 XX XXX XXXX"
                      className="border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ghanaCardId" className="text-gray-700 dark:text-gray-300">
                      Ghana Card ID
                    </Label>
                    <Input
                      id="ghanaCardId"
                      value={newUser.ghanaCardId}
                      onChange={(e) => setNewUser({ ...newUser, ghanaCardId: e.target.value })}
                      placeholder="GHA-XXXXXXXXX-X"
                      className="border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role" className="text-gray-700 dark:text-gray-300">
                      Role
                    </Label>
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                      <SelectTrigger className="border-gray-300 dark:border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="landlord">Landlord</SelectItem>
                        <SelectItem value="tenant">Tenant</SelectItem>
                        <SelectItem value="caretaker">Caretaker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="region" className="text-gray-700 dark:text-gray-300">
                      Region
                    </Label>
                    <Select value={newUser.region} onValueChange={(value) => setNewUser({ ...newUser, region: value })}>
                      <SelectTrigger className="border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        {ghanaRegions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser} className="bg-gradient-to-r from-indigo-600 to-cyan-500">
                  Create User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <AnimatedCard delay={100} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{activeUsers.length} active</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-800 dark:to-indigo-800 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={200} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Landlords</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLandlords}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Property owners</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-800 dark:to-emerald-800 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={300} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Tenants</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTenants}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Property renters</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-800 dark:to-pink-800 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={400} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingUsers.length}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Require review</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-800 dark:to-red-800 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>

          <AnimatedCard delay={500} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Caretakers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCaretakers}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Property managers</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-800 dark:to-blue-800 rounded-lg flex items-center justify-center">
                  <Settings className="h-6 w-6 text-cyan-600 dark:text-cyan-300" />
                </div>
              </div>
            </CardContent>
          </AnimatedCard>
        </div>

        {/* Enhanced Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300">
          <div className="flex gap-4 flex-1 max-w-4xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name, email, or Ghana Card ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 dark:border-gray-700"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px] border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="landlord">Landlord</SelectItem>
                <SelectItem value="tenant">Tenant</SelectItem>
                <SelectItem value="caretaker">Caretaker</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending_approval">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-[140px] border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {ghanaRegions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Table */}
        <AnimatedCard delay={500} className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              User Directory ({filteredUsers.length} users)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 dark:border-gray-600">
                  <TableHead className="text-gray-700 dark:text-gray-300">User</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Contact</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Role</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Ghana Card</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Region</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Joined</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-800 dark:to-cyan-800 flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-300">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <Phone className="h-3 w-3" />
                          {user.phone ? formatGhanaPhone(user.phone) : "No phone"}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="capitalize border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300"
                      >
                        {user.role.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <CreditCard className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                        <span className="font-mono text-gray-600 dark:text-gray-300">
                          {user.ghanaCardId || "Not provided"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                      {user.region || "Not specified"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "active"
                            ? "default"
                            : user.status === "pending_approval"
                              ? "secondary"
                              : "destructive"
                        }
                        className={
                          user.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                            : user.status === "pending_approval"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200"
                              : ""
                        }
                      >
                        {user.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.status === "pending_approval" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproveUser(user.id)}
                              className="min-h-[36px] min-w-[36px] text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-600 dark:hover:bg-green-800"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectUser(user.id)}
                              className="min-h-[36px] min-w-[36px] text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-600 dark:hover:bg-red-800"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="min-h-[36px] min-w-[36px] border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600 bg-transparent"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingUser(user)
                                setShowEditUser(true)
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() => handleDeactivateUser(user.id)}
                                className="text-red-600 dark:text-red-400"
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleReactivateUser(user.id)}
                                className="text-green-600 dark:text-green-400"
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Reactivate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleImpersonateUser(user.id)}
                              className="text-blue-600 dark:text-blue-400"
                            >
                              <LogIn className="h-4 w-4 mr-2" />
                              Impersonate User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </AnimatedCard>

        {/* User Details Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="bg-white dark:bg-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">User Details</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-300">
                Complete information for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Name</label>
                    <p className="text-gray-900 dark:text-white">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Email</label>
                    <p className="text-gray-900 dark:text-white">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Phone</label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedUser.phone ? formatGhanaPhone(selectedUser.phone) : "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Ghana Card ID</label>
                    <p className="text-gray-900 dark:text-white font-mono">
                      {selectedUser.ghanaCardId || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Role</label>
                    <p className="text-gray-900 dark:text-white capitalize">{selectedUser.role.replace("_", " ")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Status</label>
                    <p className="text-gray-900 dark:text-white capitalize">{selectedUser.status.replace("_", " ")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Region</label>
                    <p className="text-gray-900 dark:text-white">{selectedUser.region || "Not specified"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Joined Date</label>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {selectedUser.role === "landlord" && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Properties Owned</label>
                    <p className="text-gray-900 dark:text-white">3 properties</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
          <DialogContent className="bg-white dark:bg-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Edit User</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-300">
                Update user information and settings.
              </DialogDescription>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name" className="text-gray-700 dark:text-gray-300">
                      Full Name
                    </Label>
                    <Input
                      id="edit-name"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      className="border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email" className="text-gray-700 dark:text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      className="border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-phone" className="text-gray-700 dark:text-gray-300">
                      Phone Number
                    </Label>
                    <Input
                      id="edit-phone"
                      value={editingUser.phone}
                      onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                      className="border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-role" className="text-gray-700 dark:text-gray-300">
                      Role
                    </Label>
                    <Select
                      value={editingUser.role}
                      onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                    >
                      <SelectTrigger className="border-gray-300 dark:border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="landlord">Landlord</SelectItem>
                        <SelectItem value="tenant">Tenant</SelectItem>
                        <SelectItem value="caretaker">Caretaker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditUser(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditUser} className="bg-gradient-to-r from-indigo-600 to-cyan-500">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
