import { create } from 'zustand'

interface UIState {
  isLoginModalOpen: boolean
  setLoginModalOpen: (isOpen: boolean) => void
  isDeleteAccountModalOpen: boolean
  setDeleteAccountModalOpen: (isOpen: boolean) => void
  isBackupModalOpen: boolean
  setBackupModalOpen: (isOpen: boolean) => void
  // Toast Stub
  addToast: (toast: { message: string, type: 'success' | 'error' | 'info' }) => void
}

export const useUIStore = create<UIState>((set) => ({
  isLoginModalOpen: false,
  setLoginModalOpen: (isOpen) => set({ isLoginModalOpen: isOpen }),
  isDeleteAccountModalOpen: false,
  setDeleteAccountModalOpen: (isOpen) => set({ isDeleteAccountModalOpen: isOpen }),
  isBackupModalOpen: false,
  setBackupModalOpen: (isOpen) => set({ isBackupModalOpen: isOpen }),
  addToast: (toast) => console.log('TOAST:', toast.message) // Placeholder for now
}))
