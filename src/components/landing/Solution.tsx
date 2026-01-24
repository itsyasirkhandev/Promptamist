
'use client';
import Image from "next/image";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";

export function Solution() {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  return (
    <section ref={ref} id="solution" className="py-16 sm:py-24 bg-background scroll-mt-20">
      <div className={cn("container mx-auto px-4 sm:px-6 lg:px-8 opacity-0", isIntersecting && "animate-in fade-in-up")}>
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center">
          <div className="lg:col-span-5 lg:order-first">
             <Image
                src="https://i.postimg.cc/cLZmPt1f/Promtamist-dashboard-page.png"
                alt="Promptamist Dashboard"
                width={1200}
                height={800}
                className="rounded-lg shadow-xl ring-1 ring-border"
              />
          </div>
          <div className="mt-10 lg:mt-0 lg:col-span-7" style={{animationDelay: '200ms'}}>
            <div className="text-left">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-headline">
                Your Personal AI Prompt Library
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Promptamist is the bridge between your ideas and AI execution. It provides a clean, organized, and powerful interface to store, manage, and reuse your most effective prompts.
              </p>
              <p className="mt-4 text-lg text-muted-foreground">
                Stop searching and start creating.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
