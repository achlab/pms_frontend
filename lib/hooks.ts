import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux"
import type { RootState, AppDispatch } from "./store"

// Redux hooks - being phased out in favor of service hooks
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Mock selector for compatibility during migration
export const useMockSelector = <T,>(defaultValue: T) => defaultValue
