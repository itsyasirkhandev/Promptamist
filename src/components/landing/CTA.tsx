
'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";


export function CTA() {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  return (
    <section ref={ref} className="py-16 sm:py-24 bg-primary/5">
      <div className={cn("container mx-auto px-4 sm:px-6 lg:px-8 opacity-0", isIntersecting && "animate-in fade-in-up")}>
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-headline">
            Ready to Supercharge Your AI Workflow?
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Start building your personal prompt library today. It's free, and it only takes a minute to get started.
          </p>
          <div className="mt-8 flex justify-center">
            <Button size="lg" asChild>
                <Link href="/auth">
                    Get Started for Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
