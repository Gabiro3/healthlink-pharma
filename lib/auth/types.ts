import type { Session, User, AuthError } from "@supabase/supabase-js"

// Extend the User type to include role
export interface UserWithRole extends User {
  role?: string
}

// Define the shape of our auth context
export interface AuthContextType {
  user: UserWithRole | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, metadata?: { [key: string]: any }) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
}
