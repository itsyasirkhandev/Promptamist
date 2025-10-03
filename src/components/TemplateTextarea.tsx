
"use client";

import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { ControllerRenderProps } from 'react-hook-form';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';

interface TemplateTextareaProps {
  field: ControllerRenderProps<any, 'content'>;
  isTemplate: boolean;
  onSelectionChange: (hasSelection: boolean, selectionText: string) => void;
}

export function TemplateTextarea({ field, isTemplate, onSelectionChange }: TemplateTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleSelect = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const { selectionStart, selectionEnd } = textarea;
    const hasSelection = selectionStart !== selectionEnd;
    const selectedText = textarea.value.substring(selectionStart, selectionEnd);
    onSelectionChange(hasSelection, selectedText);
  };
  
  useEffect(() => {
    document.addEventListener("selectionchange", handleSelect);
    return () => {
        document.removeEventListener("selectionchange", handleSelect);
    }
  }, [])

  const highlightedContent = useMemo(() => {
    if (!isTemplate) return field.value;
    const regex = /{{(.*?)}}/g;
    return field.value.replace(regex, `<span class="bg-primary/20 rounded-sm px-1 text-primary font-medium">${'$&'}</span>`);
  }, [field.value, isTemplate]);

  const handleScroll = () => {
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };
  
  return (
    <div className="relative">
      {isTemplate && (
         <div
            ref={backdropRef}
            className="absolute inset-0 overflow-auto pointer-events-none whitespace-pre-wrap font-mono leading-relaxed tracking-wide text-transparent border border-transparent rounded-md px-3 py-2 text-base md:text-sm"
            dangerouslySetInnerHTML={{ __html: highlightedContent + '\n' }}
         />
      )}
      <Textarea
        {...field}
        ref={textareaRef}
        onScroll={handleScroll}
        placeholder="e.g., 'Generate 5 blog post ideas about {{topic}}. The ideas should be engaging and SEO-friendly...'"
        className={cn(
          'min-h-[150px] font-mono leading-relaxed tracking-wide',
          isTemplate ? 'bg-transparent caret-foreground' : ''
        )}
      />
    </div>
  );
}


