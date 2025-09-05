import { View, Text } from 'react-native'
import React, { createContext, useContext, useState } from 'react'
import GlobalToast, { Toast } from '@/components/GlobalToast'

const ToastContext = createContext({
    showToast: (message: string, type: "error" | "success" | "info" = "info", duration = 3000) => {}
})

export default function ToastProvider({children}: {children: React.ReactNode}) {
    const [toast, setToast] = useState<Toast | null>(null)
    const showToast = (message: string, type: "error" | "success" | "info" = "info", duration = 3000) => {
        setToast({message, type})
        setTimeout(() => setToast(null), duration)
    }
  return (
    <ToastContext.Provider value={{showToast}}>
        {children}
      {toast && <GlobalToast toast={toast} />}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)