import type { Property, Activity, DashboardStats } from "./types"

// Mock data
const mockProperties: Property[] = [
  {
    id: 1,
    name: "Sunset Apartments",
    address: "123 Sunset Blvd, Los Angeles, CA",
    type: "Apartment Complex",
    units: 24,
    occupied: 23,
    monthlyRevenue: 12800,
    bedrooms: "1-3",
    bathrooms: "1-2",
    sqft: "650-1200",
    status: "Active",
    image: "/modern-apartment-building.png",
    createdAt: "2024-01-15",
    updatedAt: "2024-12-20",
  },
  {
    id: 2,
    name: "Oak Street Complex",
    address: "456 Oak Street, Beverly Hills, CA",
    type: "Luxury Apartments",
    units: 16,
    occupied: 16,
    monthlyRevenue: 8400,
    bedrooms: "2-4",
    bathrooms: "2-3",
    sqft: "900-1800",
    status: "Active",
    image: "/luxury-apartment-complex.png",
    createdAt: "2024-02-10",
    updatedAt: "2024-12-19",
  },
  {
    id: 3,
    name: "Pine Avenue Townhomes",
    address: "789 Pine Ave, Santa Monica, CA",
    type: "Townhomes",
    units: 8,
    occupied: 7,
    monthlyRevenue: 3300,
    bedrooms: "3-4",
    bathrooms: "2-3",
    sqft: "1400-1800",
    status: "Active",
    image: "/modern-townhomes.png",
    createdAt: "2024-03-05",
    updatedAt: "2024-12-18",
  },
  {
    id: 4,
    name: "Downtown Lofts",
    address: "321 Main St, Downtown LA, CA",
    type: "Loft Apartments",
    units: 12,
    occupied: 10,
    monthlyRevenue: 6200,
    bedrooms: "1-2",
    bathrooms: "1-2",
    sqft: "800-1400",
    status: "Maintenance",
    image: "/industrial-loft-apartments.png",
    createdAt: "2024-04-12",
    updatedAt: "2024-12-17",
  },
]

const mockActivities: Activity[] = [
  {
    id: 1,
    type: "payment",
    title: "Payment received",
    description: "$1,200 from John Smith - Apt 4B",
    propertyId: 1,
    amount: 1200,
    timestamp: "2024-12-20T14:30:00Z",
    status: "completed",
  },
  {
    id: 2,
    type: "maintenance",
    title: "Maintenance request",
    description: "Leaky faucet - 123 Oak Street",
    propertyId: 2,
    timestamp: "2024-12-20T09:15:00Z",
    status: "pending",
  },
  {
    id: 3,
    type: "application",
    title: "New tenant application",
    description: "Sarah Johnson - 456 Pine Ave",
    propertyId: 3,
    timestamp: "2024-12-19T16:45:00Z",
    status: "pending",
  },
]

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const api = {
  // Properties
  async getProperties(): Promise<Property[]> {
    await delay(800)
    return [...mockProperties]
  },

  async getProperty(id: number): Promise<Property | null> {
    await delay(500)
    return mockProperties.find((p) => p.id === id) || null
  },

  async createProperty(property: Omit<Property, "id" | "createdAt" | "updatedAt">): Promise<Property> {
    await delay(1000)
    const newProperty: Property = {
      ...property,
      id: Math.max(...mockProperties.map((p) => p.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockProperties.push(newProperty)
    return newProperty
  },

  async updateProperty(id: number, updates: Partial<Property>): Promise<Property | null> {
    await delay(800)
    const index = mockProperties.findIndex((p) => p.id === id)
    if (index === -1) return null

    mockProperties[index] = {
      ...mockProperties[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    return mockProperties[index]
  },

  async deleteProperty(id: number): Promise<boolean> {
    await delay(600)
    const index = mockProperties.findIndex((p) => p.id === id)
    if (index === -1) return false

    mockProperties.splice(index, 1)
    return true
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    await delay(600)
    const totalProperties = mockProperties.length
    const totalUnits = mockProperties.reduce((sum, p) => sum + p.units, 0)
    const occupiedUnits = mockProperties.reduce((sum, p) => sum + p.occupied, 0)
    const monthlyRevenue = mockProperties.reduce((sum, p) => sum + p.monthlyRevenue, 0)
    const pendingIssues = mockActivities.filter((a) => a.status === "pending").length
    const occupancyRate = Math.round((occupiedUnits / totalUnits) * 100)

    return {
      totalProperties,
      totalUnits,
      occupiedUnits,
      monthlyRevenue,
      pendingIssues,
      occupancyRate,
      revenueGrowth: 8.2,
    }
  },

  // Activities
  async getRecentActivities(limit = 10): Promise<Activity[]> {
    await delay(400)
    return mockActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  },

  async createActivity(activity: Omit<Activity, "id" | "timestamp">): Promise<Activity> {
    await delay(500)
    const newActivity: Activity = {
      ...activity,
      id: Math.max(...mockActivities.map((a) => a.id)) + 1,
      timestamp: new Date().toISOString(),
    }
    mockActivities.push(newActivity)
    return newActivity
  },
}
