'use client';

import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    // 전체 화면을 덮는 오버레이
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 (클릭하면 모달 닫힘) */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      {/* 모달 창 */}
      <div className="relative bg-white rounded shadow-lg p-6 z-10 max-w-lg w-full">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}