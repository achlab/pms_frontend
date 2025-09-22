"use client"

import type React from "react"
import { createContext, useContext, useReducer } from "react"
import type { Property } from "@/lib/types"
import { api } from "@/lib/api"

interface PropertyState {
  properties: Property[]
  loading: boolean
  error: string | null
  selectedProperty: Property | null
}

type PropertyAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_PROPERTIES"; payload: Property[] }
  | { type: "SET_SELECTED_PROPERTY"; payload: Property | null }
  | { type: "ADD_PROPERTY"; payload: Property }
  | { type: "UPDATE_PROPERTY"; payload: Property }
  | { type: "DELETE_PROPERTY"; payload: number }

const initialState: PropertyState = {
  properties: [],
  loading: false,
  error: null,
  selectedProperty: null,
}

function propertyReducer(state: PropertyState, action: PropertyAction): PropertyState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }
    case "SET_PROPERTIES":
      return { ...state, properties: action.payload, loading: false, error: null }
    case "SET_SELECTED_PROPERTY":
      return { ...state, selectedProperty: action.payload }
    case "ADD_PROPERTY":
      return { ...state, properties: [...state.properties, action.payload] }
    case "UPDATE_PROPERTY":
      return {
        ...state,
        properties: state.properties.map((p) => (p.id === action.payload.id ? action.payload : p)),
      }
    case "DELETE_PROPERTY":
      return {
        ...state,
        properties: state.properties.filter((p) => p.id !== action.payload),
      }
    default:
      return state
  }
}

interface PropertyContextType extends PropertyState {
  fetchProperties: () => Promise<void>
  fetchProperty: (id: number) => Promise<void>
  createProperty: (property: Omit<Property, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateProperty: (id: number, updates: Partial<Property>) => Promise<void>
  deleteProperty: (id: number) => Promise<void>
  clearError: () => void
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined)

export function PropertyProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(propertyReducer, initialState)

  const fetchProperties = async () => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const properties = await api.getProperties()
      dispatch({ type: "SET_PROPERTIES", payload: properties })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch properties" })
    }
  }

  const fetchProperty = async (id: number) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const property = await api.getProperty(id)
      dispatch({ type: "SET_SELECTED_PROPERTY", payload: property })
      dispatch({ type: "SET_LOADING", payload: false })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch property" })
    }
  }

  const createProperty = async (propertyData: Omit<Property, "id" | "createdAt" | "updatedAt">) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const newProperty = await api.createProperty(propertyData)
      dispatch({ type: "ADD_PROPERTY", payload: newProperty })
      dispatch({ type: "SET_LOADING", payload: false })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to create property" })
    }
  }

  const updateProperty = async (id: number, updates: Partial<Property>) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const updatedProperty = await api.updateProperty(id, updates)
      if (updatedProperty) {
        dispatch({ type: "UPDATE_PROPERTY", payload: updatedProperty })
      }
      dispatch({ type: "SET_LOADING", payload: false })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to update property" })
    }
  }

  const deleteProperty = async (id: number) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const success = await api.deleteProperty(id)
      if (success) {
        dispatch({ type: "DELETE_PROPERTY", payload: id })
      }
      dispatch({ type: "SET_LOADING", payload: false })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to delete property" })
    }
  }

  const clearError = () => {
    dispatch({ type: "SET_ERROR", payload: null })
  }

  return (
    <PropertyContext.Provider
      value={{
        ...state,
        fetchProperties,
        fetchProperty,
        createProperty,
        updateProperty,
        deleteProperty,
        clearError,
      }}
    >
      {children}
    </PropertyContext.Provider>
  )
}

export function useProperties() {
  const context = useContext(PropertyContext)
  if (context === undefined) {
    throw new Error("useProperties must be used within a PropertyProvider")
  }
  return context
}
