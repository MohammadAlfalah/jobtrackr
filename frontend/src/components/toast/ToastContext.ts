import { createContext } from 'react'

export type ToastKind = 'success' | 'error'

export interface ToastContextValue {
  /** Show a transient toast message. */
  notify: (message: string, kind?: ToastKind) => void
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined)
