'use client';

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Load JoditEditor only on client
const JoditEditor = dynamic(() => import('jodit-react'), {
  ssr: false,
});

import {
  useGetTermsAndConditionQuery,
  useUpdateTermsAndConditionMutation,
} from '@/lib/store';
import { Button } from '../ui/button';

export function TermsSettings() {
  const editor = useRef(null);
  const { data: termsData, isLoading, isError, refetch } =
    useGetTermsAndConditionQuery({});
  const [updateTerms] = useUpdateTermsAndConditionMutation();

  const [content, setContent] = useState('');

  useEffect(() => {
    if (termsData?.data?.content) {
      setContent(termsData.data.content);
    }
  }, [termsData]);

  const handleSubmit = async () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const plainText = tempDiv.innerText.trim();

    if (!plainText) {
      toast.error('Content cannot be empty');
      return;
    }

    try {
      await updateTerms({ type: 'terms', content }).unwrap();
      toast.success('Terms & Conditions saved successfully!');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save Terms & Conditions');
    }
  };

  const config = {
    theme: 'default',
    showCharsCounter: false,
    showWordsCounter: false,
    toolbarAdaptive: true,
    toolbarSticky: false,
    enableDragAndDropFileToEditor: false,
    allowResizeX: false,
    allowResizeY: false,
    statusbar: false,
    buttons: [
      'source',
      '|',
      'bold',
      'italic',
      'underline',
      '|',
      'ul',
      'ol',
      '|',
      'font',
      'fontsize',
      'brush',
      'paragraph',
      '|',
      'image',
      'table',
      'link',
      '|',
      'left',
      'center',
      'right',
      'justify',
      '|',
      'undo',
      'redo',
      '|',
      'hr',
      'eraser',
      'fullsize',
    ],
    placeholder: 'Enter your terms here...',
    useSearch: false,
    spellcheck: false,
    iframe: false,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    toolbarButtonSize: 'small',
    readonly: false,
    style: { minHeight: '60vh', background: '#ededeed' },
    observer: { timeout: 100 },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center mt-8">
        Failed to load Terms & Conditions
      </div>
    );
  }

  return (
    <div className="bg-white h-full p-4 rounded-2xl">
      <div className="mb-6">
        <h1 className="text-2xl text-primary font-semibold">
          Terms & Conditions
        </h1>
        <p className="text-slate-600 pt-3">
          Edit your application's Terms & Conditions
        </p>
      </div>

      <div>
        <JoditEditor
          ref={editor}
          value={content}
          // @ts-ignore
          config={config}
          tabIndex={1}
          onBlur={(newContent: any) => setContent(newContent)}
          onChange={() => {}} // prevents hydration warnings
        />

        <div className="flex items-center justify-end gap-4 mt-4">
          <Button
            type="submit"
            className="bg-[#CD671C] hover:bg-[#B85A18] text-white"
            onClick={handleSubmit}
          >
            Update
          </Button>
        </div>
      </div>
    </div>
  );
}
