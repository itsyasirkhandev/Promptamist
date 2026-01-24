'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { cn } from '@/lib/utils';

export function Hero() {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  return (
    <section ref={ref} className="bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn("grid lg:grid-cols-2 lg:gap-12 items-center min-h-[calc(100vh-6rem)] py-12 lg:py-0 opacity-0", isIntersecting && "animate-in fade-in-up")}>
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground font-headline">
              Stop Repeating Yourself to AI.
            </h1>
            <p className="mt-6 max-w-2xl mx-auto lg:mx-0 text-lg sm:text-xl text-muted-foreground">
              Promptamist is your personal command center for AI prompts. Save, organize, and reuse your best prompts as powerful templates. Never lose a great prompt again.
            </p>
            <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
              <Button size="lg" asChild>
                <Link href="/auth">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              100% Free. Forever.
            </p>
          </div>
          <div className="mt-12 lg:mt-0">
             <Image
                src="https://i.postimg.cc/cLZmPt1f/Promtamist-dashboard-page.png"
                alt="Promptamist Dashboard"
                width={1200}
                height={800}
                className="rounded-lg shadow-xl ring-1 ring-border"
              />
          </div>
        </div>
      </div>
    </section>
  );
}
