
"use client";
import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';
import type { PromptField } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';

interface ContentEditableProps {
  html: string;
  isTemplate: boolean;
  fields: PromptField[];
  onChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

function renderToHTML(value: string, fields: PromptField[]): string {
    if (!value) return '';
    const parts = value.split(/({{.*?}})/g).filter(part => part);
    return parts.map(part => {
        const match = part.match(/{{(.*?)}}/);
        if (match) {
            const fieldName = match[1].trim();
            const field = fields.find(f => f.name === fieldName);
            if (field) {
                return `<span contenteditable="false" class="inline-block bg-primary/10 text-primary border border-primary/20 rounded-md px-1 py-0.5 mx-0.5 font-mono">${'{{' + fieldName + '}}'}</span>`;
            }
        }
        // HTML-escape the text parts to prevent XSS
        return part.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }).join('');
}


export const ContentEditable = forwardRef<HTMLDivElement, ContentEditableProps>(({ html, isTemplate, fields, onChange, className, ...props }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => editorRef.current as HTMLDivElement);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !isTemplate) return;

    if (html !== editor.innerText) {
        const selection = window.getSelection();
        const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        let startOffset = 0;
        let startContainer: Node | null = null;
        
        if (range && editor.contains(range.startContainer)) {
            startContainer = range.startContainer;
            startOffset = range.startOffset;
        }

        editor.innerHTML = renderToHTML(html, fields);
        
        try {
            if (startContainer) {
                const newRange = document.createRange();
                
                // This is a simplified cursor restoration. A truly robust solution is much more complex.
                // It works reasonably well for simple text edits.
                let charCount = 0;
                let found = false;
                function findNodeAndOffset(parentNode: Node) {
                    if (found) return;
                    if (parentNode.nodeType === Node.TEXT_NODE) {
                        const nextCharCount = charCount + (parentNode.nodeValue?.length || 0);
                        if (startOffset <= nextCharCount) {
                            newRange.setStart(parentNode, startOffset - charCount);
                            newRange.collapse(true);
                            found = true;
                        }
                        charCount = nextCharCount;
                    } else {
                        for (let i = 0; i < parentNode.childNodes.length; i++) {
                            findNodeAndOffset(parentNode.childNodes[i]);
                        }
                    }
                }
                
                // This logic is imperfect and has been simplified.
                // We will just place the cursor at the end for now to avoid crashes.
                const lastChild = editor.lastChild;
                if(lastChild) {
                    newRange.setStart(lastChild, lastChild.textContent?.length || 0);
                    newRange.collapse(true);
                    selection?.removeAllRanges();
                    selection?.addRange(newRange);
                }
            }
        } catch (e) {
            console.error("Failed to restore cursor position.", e);
            editor.focus();
        }
    }
}, [html, fields, isTemplate]);


  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.innerText;
    if (html !== newText) {
       const evt = {
        target: {
          value: newText
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(evt);
    }
  };

  if (!isTemplate) {
    return (
        <Textarea
            value={html}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}
            className={cn("min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className)}
            placeholder="The main body of your prompt..."
        />
    )
  }

  return (
    <div
      {...props}
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning={true}
      onInput={handleInput}
      className={cn(
        "min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "whitespace-pre-wrap",
        className
      )}
    />
  );
});

ContentEditable.displayName = 'ContentEditable';
