"use client";

import { useState, useEffect } from "react";
import { Dialog } from "radix-ui";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { XIcon, Sparkles, Pencil, Check, X } from "lucide-react";

interface PromptReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalPrompt: string;
  enhancedPrompt: string;
  isEditing: boolean;
  onAccept: () => void;
  onReject: () => void;
  onStartEditing: () => void;
  onConfirmEdit: (edited: string) => void;
  type: "audio" | "image";
}

const PromptReviewModal = ({
  isOpen,
  onClose,
  originalPrompt,
  enhancedPrompt,
  isEditing,
  onAccept,
  onReject,
  onStartEditing,
  onConfirmEdit,
  type,
}: PromptReviewModalProps) => {
  const [editedText, setEditedText] = useState(enhancedPrompt);

  useEffect(() => {
    setEditedText(enhancedPrompt);
  }, [enhancedPrompt]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-[10vh] z-[1001] w-full max-w-2xl -translate-x-1/2 border-4 border-orange-1 bg-black-1 p-8 shadow-[8px_8px_0px_0px_rgba(249,117,53,0.3)] noise-texture data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-1.5 bg-orange-1" />
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-1" />
                  <Dialog.Title className="text-20 font-bold text-white-1 uppercase tracking-wide">
                    Prompt Enhanced
                  </Dialog.Title>
                </div>
                <Dialog.Description className="text-12 text-white-4 uppercase tracking-widest mt-1">
                  {type === "audio" ? "Voice Prompt" : "Image Prompt"}
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="text-white-4 hover:text-white-1 transition-colors">
                <XIcon className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Original */}
          <div className="mb-4">
            <span className="text-10 font-bold text-white-4 uppercase tracking-widest">
              Original
            </span>
            <div className="mt-2 bg-black-6 border-l-4 border-white-4/30 p-4">
              <p className="text-14 text-white-3 font-serif leading-relaxed">
                {originalPrompt}
              </p>
            </div>
          </div>

          {/* Enhanced */}
          <div className="mb-6">
            <span className="text-10 font-bold text-orange-1 uppercase tracking-widest">
              Enhanced
            </span>
            {isEditing ? (
              <Textarea
                className="mt-2 input-class font-medium text-14 min-h-[120px]"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                autoFocus
              />
            ) : (
              <div className="mt-2 bg-black-6 border-l-4 border-orange-1 p-4">
                <p className="text-14 text-white-1 font-serif leading-relaxed">
                  {enhancedPrompt}
                </p>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="plain"
                  className="text-14 text-white-4 hover:text-white-1 uppercase tracking-wide"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="btn-brutal h-12 text-14"
                  onClick={() => onConfirmEdit(editedText)}
                >
                  <Check size={16} className="mr-2" />
                  Confirm Edit
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="plain"
                  className="text-14 text-white-4 hover:text-white-1 uppercase tracking-wide"
                  onClick={onReject}
                >
                  <X size={16} className="mr-1" />
                  Reject
                </Button>
                <Button
                  type="button"
                  variant="plain"
                  className="text-14 text-orange-1 border-2 border-orange-1 px-4 py-2 hover:bg-orange-1/10 uppercase tracking-wide"
                  onClick={onStartEditing}
                >
                  <Pencil size={16} className="mr-1" />
                  Edit
                </Button>
                <Button
                  type="button"
                  className="btn-brutal h-12 text-14"
                  onClick={onAccept}
                >
                  <Check size={16} className="mr-2" />
                  Accept
                </Button>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PromptReviewModal;
