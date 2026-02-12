import { create } from 'zustand';
import React from 'react';

interface ModalState {
  isOpen: boolean;
  title?: React.ReactNode;
  content?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  inputValue?: string;
  placeholder?: string;
  onOk?: (inputValue?: string) => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  width?: number;
  maskBlur?: boolean;
  openModal: (config: Partial<Omit<ModalState, 'isOpen' | 'openModal' | 'closeModal'>>) => void;
  closeModal: () => void;
  setInputValue: (value: string) => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  title: '',
  content: '',
  okText: 'Ok',
  cancelText: 'Cancel',
  inputValue: '',
  placeholder: '',
  width: 420,
  maskBlur: true,
  onOk: undefined,
  onCancel: undefined,
  openModal: (config) =>
    set({
      isOpen: true,
      inputValue: config.inputValue || '',
      ...config,
    }),
  closeModal: () =>
    set({
      isOpen: false,
      title: '',
      content: '',
      inputValue: '',
      onOk: undefined,
      onCancel: undefined,
    }),
  setInputValue: (value) => set({ inputValue: value }),
}));
