import React from 'react';

export default function Modal({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
            <div className='bg-white rounded-lg p-6 w-[60vw] h-[70vh] relative'>
                <button className='absolute top-2 right-2 text-gray-500 hover:text-gray-700' onClick={onClose}>
                    ✕
                </button>
                {children}
            </div>
        </div>
    );
}