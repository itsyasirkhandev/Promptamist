
"use client";
import React, { useRef, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';

interface ContentEditableProps extends React.HTMLAttributes<HTMLDivElement> {
  html: string;
  isTemplate: boolean;
  onChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ContentEditable = forwardRef<HTMLDivElement, ContentEditableProps>(({ html, isTemplate, onChange, className, ...props }, ref) => {
  const localRef = useRef<HTMLDivElement>(null);

  // Expose the localRef to the parent component
  useImperativeHandle(ref, () => localRef.current!);

  const lastHtml = useRef(html);

  const highlightedContent = useMemo(() => {
    if (!isTemplate) return html;
    const regex = /{{(.*?)}}/g;
    return html.replace(regex, `<span class="bg-primary/20 rounded-sm font-medium text-primary">${'$&'}</span>`);
  }, [html, isTemplate]);

  useEffect(() => {
    if (localRef.current && html !== localRef.current.innerHTML) {
      localRef.current.innerHTML = highlightedContent;
      lastHtml.current = html;
    }
  }, [html, highlightedContent]);

  const emitChange = () => {
    if (!localRef.current) return;
    const currentHtml = localRef.current.innerHTML;
    if (lastHtml.current !== currentHtml) {
      const evt = {
        target: {
          value: localRef.current.innerText || ''
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(evt);
    }
    lastHtml.current = currentHtml;
  };

  return (
    <div
      {...props}
      ref={localRef}
      contentEditable={!props.contentEditable === false}
      onInput={emitChange}
      onBlur={emitChange}
      dangerouslySetInnerHTML={{ __html: highlightedContent }}
      className={cn("whitespace-pre-wrap", className)}
    />
  );
});

ContentEditable.displayName = 'ContentEditable';
