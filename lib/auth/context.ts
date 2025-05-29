"use client"

import { createContext } from "react"
import type { AuthContextType } from "./types"

// Create the context with a default undefined value, but with the correct type
export const AuthContext = createContext<AuthContextType | undefined>(undefined)
