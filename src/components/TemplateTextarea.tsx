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
      
      // Calculate button position
      const text = textarea.value.substring(0, selectionStart);
      const lines = text.split('\n');
      const lineIndex = lines.length - 1;
      const charIndex = lines[lineIndex].length;
      
      const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight);
      const top = (lineIndex * lineHeight) - textarea.scrollTop + 5;

      // This is an approximation
      const span = document.createElement('span');
      span.style.font = getComputedStyle(textarea).font;
      span.style.visibility = 'hidden';
      span.style.position = 'absolute';
      span.innerText = lines[lineIndex].substring(0, charIndex);
      document.body.appendChild(span);
      const left = span.offsetWidth - textarea.scrollLeft + 10;
      document.body.removeChild(span);

      setButtonPosition({ top, left: Math.max(left, 10) });

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
    // This regex will find all instances of {{...}}
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
            className="absolute inset-0 p-2 overflow-hidden pointer-events-none text-base md:text-sm whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: highlightedContent + '\n' }} // Add newline to ensure scroll height matches
         />
      )}
      <Textarea
        {...field}
        ref={textareaRef}
        onSelect={handleSelect}
        onScroll={handleScroll}
        placeholder="e.g., 'Generate 5 blog post ideas about {{topic}}. The ideas should be engaging and SEO-friendly...'"
        className={`min-h-[150px] ${isTemplate ? 'bg-transparent text-transparent caret-foreground' : ''}`}
      />
      {buttonPosition && (
        <Button
          type="button"
          size="sm"
          className="absolute"
          style={{ top: `${buttonPosition.top}px`, left: `${buttonPosition.left}px` }}
          onClick={handleMakeFieldClick}
          onMouseDown={(e) => e.preventDefault()} // Prevents textarea from losing focus
        >
          <Wand2 className="mr-2 h-4 w-4" />
          Make Field
        </Button>
      )}
    </div>
  );
}
