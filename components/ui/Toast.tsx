'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error';

interface ToastProps {
    message: string;
    type?: ToastType;
    isVisible: boolean;
    onClose: () => void;
}

export function Toast({ message, type = 'success', isVisible, onClose }: ToastProps) {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return createPortal(
        <div className="fixed top-20 right-4 z-[60] flex items-center gap-3 rounded-lg bg-white p-4 shadow-xl border border-gray-100 animate-in slide-in-from-top-5 fade-in duration-300">
            {type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
                <XCircle className="h-5 w-5 text-red-500" />
            )}
            <p className="text-sm font-medium text-gray-800">{message}</p>
        </div>,
        document.body
    );
}
