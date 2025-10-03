"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Wand2 } from 'lucide-react';

interface TemplateTextareaProps {
  field: ControllerRenderProps<any, 'content'>;
  isTemplate: boolean;
  onMakeField: (selection: string) => void;
}

export function TemplateTextarea({ field, isTemplate, onMakeField }: TemplateTextareaProps) {
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleSelect = () => {
    if (!textareaRef.current || !isTemplate) return;

    const textarea = textareaRef.current;
    const { selectionStart, selectionEnd } = textarea;

    if (selectionStart !== selectionEnd) {
      setSelection({ start: selectionStart, end: selectionEnd });
      
      const text = textarea.value.substring(0, selectionStart);
      const preSelectionText = textarea.value.substring(0, selectionStart);
      const selectionText = textarea.value.substring(selectionStart, selectionEnd);

      const tempDiv = document.createElement('div');
      tempDiv.style.font = getComputedStyle(textarea).font;
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.position = 'absolute';
      tempDiv.style.whiteSpace = 'pre-wrap';
      tempDiv.style.width = `${textarea.clientWidth}px`;
      
      const preSpan = document.createElement('span');
      preSpan.textContent = preSelectionText;
      
      const selSpan = document.createElement('span');
      selSpan.textContent = selectionText;

      tempDiv.appendChild(preSpan);
      tempDiv.appendChild(selSpan);
      
      document.body.appendChild(tempDiv);
      
      const rect = selSpan.getBoundingClientRect();
      const textareaRect = textarea.getBoundingClientRect();

      document.body.removeChild(tempDiv);
      
      const top = rect.top - textareaRect.top - textarea.scrollTop;
      const left = rect.left - textareaRect.left - textarea.scrollLeft;

      setButtonPosition({ top: top - 32, left });

    } else {
      setSelection(null);
      setButtonPosition(null);
    }
  };

  const handleMakeFieldClick = () => {
    if (selection && textareaRef.current) {
      const selectedText = textareaRef.current.value.substring(selection.start, selection.end);
      onMakeField(selectedText);
      setSelection(null);
      setButtonPosition(null);
    }
  };

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
    // Recalculate button position on scroll
    handleSelect();
  };
  
  return (
    <div className="relative">
      {isTemplate && (
         <div
            ref={backdropRef}
            className="absolute inset-0 p-2 overflow-hidden pointer-events-none text-base md:text-sm whitespace-pre-wrap font-mono leading-relaxed tracking-wide"
            dangerouslySetInnerHTML={{ __html: highlightedContent + '\n' }} // Add newline to ensure scroll height matches
         />
      )}
      <Textarea
        {...field}
        ref={textareaRef}
        onSelect={handleSelect}
        onScroll={handleScroll}
        placeholder="e.g., 'Generate 5 blog post ideas about {{topic}}. The ideas should be engaging and SEO-friendly...'"
        className={cn(
          'min-h-[150px] font-mono leading-relaxed tracking-wide',
          isTemplate ? 'bg-transparent text-transparent caret-foreground selection:bg-blue-300/30' : ''
        )}
      />
      {buttonPosition && (
        <Button
          type="button"
          size="sm"
          className="absolute h-7 px-2"
          style={{ top: `${buttonPosition.top}px`, left: `${buttonPosition.left}px` }}
          onClick={handleMakeFieldClick}
          onMouseDown={(e) => e.preventDefault()} // Prevents textarea from losing focus
        >
          <Wand2 className="mr-1.5 h-3.5 w-3.5" />
          Make Field
        </Button>
      )}
    </div>
  );
}
