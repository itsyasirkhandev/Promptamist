'use client';

import Image from "next/image";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

export function Solution() {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  const benefits = [
    "Save hours of repetitive typing",
    "Maintain consistent output quality",
    "Share best practices with your team",
    "Iterate and improve prompts over time"
  ];

  return (
    <section ref={ref} id="solution" className="py-24 bg-muted/20 scroll-mt-20">
      <div className={cn("container mx-auto px-4 sm:px-6 lg:px-8 opacity-0", isIntersecting && "animate-in fade-in-up duration-700")}>
        <div className="lg:grid lg:grid-cols-12 lg:gap-16 lg:items-center">
          
          <div className="lg:col-span-6 lg:order-last relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-primary/20 rounded-xl blur-xl opacity-50" />
              <div className="relative rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm shadow-2xl overflow-hidden">
                 <Image
                    src="https://i.postimg.cc/cLZmPt1f/Promtamist-dashboard-page.png"
                    alt="Promptamist Dashboard"
                    width={1200}
                    height={800}
                    className="w-full h-auto"
                  />
              </div>
          </div>

          <div className="mt-12 lg:mt-0 lg:col-span-6 lg:order-first">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight font-headline mb-6">
              Your Personal <br />
              <span className="text-primary">AI Prompt Library</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Promptamist is the bridge between your ideas and AI execution. We provide the structure you need to treat prompts like the valuable assets they are.
            </p>
            
            <ul className="space-y-4">
                {benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center">
                        <CheckCircle2 className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-foreground font-medium">{benefit}</span>
                    </li>
                ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}