'use client';

import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { cn } from '@/lib/utils';
import React from 'react';

interface ScrollAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    threshold?: number;
    delay?: number;
}

export function ScrollAnimation({ 
    children, 
    className, 
    threshold = 0.1, 
    delay = 0,
    style,
    ...props 
}: ScrollAnimationProps) {
    const [ref, isIntersecting] = useIntersectionObserver({ threshold, triggerOnce: true });

    return (
        <div
            ref={ref}
            className={cn(
                "opacity-0",
                isIntersecting && "animate-in fade-in-up fill-mode-forwards opacity-100",
                className
            )}
            style={{
                ...style,
                animationDelay: delay ? `${delay}ms` : undefined
            }}
            {...props}
        >
            {children}
        </div>
    );
}
