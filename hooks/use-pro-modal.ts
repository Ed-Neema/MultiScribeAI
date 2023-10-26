import { create } from "zustand";

interface useProModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useProModal = create<useProModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

import { useState, createContext, ReactNode } from "react";

type ProModalState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};
