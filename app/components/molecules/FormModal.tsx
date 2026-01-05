"use client";

import { ReactNode, FormEvent } from "react";
import Button from "../atoms/Button";
import Modal from "./Modal";

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  title: string;
  children: ReactNode;
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export default function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = "Submit",
  cancelText = "Cancel",
  isLoading = false,
  maxWidth = "md"
}: FormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={maxWidth} showCloseButton={false}>
      <form onSubmit={onSubmit} className="space-y-6">
        {children}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            fullWidth
            loading={isLoading}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}