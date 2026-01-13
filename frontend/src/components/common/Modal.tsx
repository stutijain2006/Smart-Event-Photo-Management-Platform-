import React from 'react';

export default function Modal({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 bg-black/50 overflow-y-auto z-50 '>
            <div className='min-h-screen flex items-center justify-center px-4 py-10'>
                <div className='bg-white rounded-lg p-6 max-w-6xl relative'>
                    <button className='absolute top-2 right-2 text-gray-500 hover:text-gray-700' onClick={onClose}>
                        ✕
                    </button>
                    {children}
                </div>
            </div>
        </div>
    );
}