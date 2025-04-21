'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import TMEditForm from '@/components/TMEditForm';

export default function TMEditPage() {
  const searchParams = useSearchParams();

  const initialSource = searchParams.get('source') || '';
  const initialTarget = searchParams.get('target') || '';
  const initialSourceLang = searchParams.get('sourceLang') || 'ko';
  const initialTargetLang = searchParams.get('targetLang') || 'en';
  const initialStatus = searchParams.get('status') || 'MT';
  const initialComment = searchParams.get('comment') || '';

  console.log('TMEditPage loaded with initialStatus:', initialStatus);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">TM 수정</h1>
      <TMEditForm
        initialSource={initialSource}
        initialTarget={initialTarget}
        initialComment={initialComment}
        initialStatus={initialStatus}
        sourceLang={initialSourceLang}
        targetLang={initialTargetLang}
        onUpdate={() => {
          alert('업데이트가 완료되었습니다.');
          if (window.opener) {
            window.opener.location.reload();
          }
          window.close();
        }}
        status={initialStatus} // Added status prop for TMEditForm
      />
    </div>
  );
}