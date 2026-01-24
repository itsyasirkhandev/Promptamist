'use client';

import { Library, Wand2, Tags, Copy, Zap, Search, Share2, Layers } from "lucide-react";
import Image from "next/image";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: <Library className="h-6 w-6 text-primary" />,
    title: "Centralized Library",
    description: "A single, searchable home for every prompt you create. No more lost notes or scattered documents.",
    className: "lg:col-span-2"
  },
  {
    icon: <Wand2 className="h-6 w-6 text-purple-500" />,
    title: "Dynamic Templating",
    description: "Turn any prompt into a reusable template with dynamic fields like {{topic}} or {{tone}}.",
    className: "lg:col-span-1"
  },
  {
    icon: <Tags className="h-6 w-6 text-pink-500" />,
    title: "Tagging & Filtering",
    description: "Organize your prompts with custom tags and find exactly what you need in seconds.",
    className: "lg:col-span-1"
  },
  {
    icon: <Copy className="h-6 w-6 text-indigo-500" />,
    title: "One-Click Copy",
    description: "Instantly copy any prompt or generated template to your clipboard, ready for use.",
    className: "lg:col-span-2"
  }
];

export function Features() {
  const [ref, isIntersecting] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  return (
    <section ref={ref} id="features" className="py-24 bg-muted/30 scroll-mt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
      
      <div className={cn("container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 opacity-0", isIntersecting && "animate-in fade-in-up duration-700")}>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight font-headline">
            Everything You Need to <br />
            <span className="text-primary">Master Your Prompts</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            From simple snippets to complex, multi-variable templates, Promptamist provides the tools to streamline your AI workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
                <div 
                    key={feature.title} 
                    className={cn(
                        "group relative overflow-hidden rounded-2xl border border-border/50 bg-background p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                        feature.className
                    )}
                    style={{animationDelay: `calc(${i * 100}ms)`}}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative z-10">
                        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 transition-colors">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                </div>
            ))}
             <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-8 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-2 shadow-xl overflow-hidden">
                 <div className="relative w-full aspect-[2/1] lg:aspect-[3/1] bg-muted/50 rounded-xl overflow-hidden">
                    <Image
                        src="https://i.postimg.cc/XYQwh2z7/promptamist-use-prompt-dialog.png"
                        alt="Use prompt template dialog"
                        fill
                        className="object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                 </div>
            </div>
        </div>
      </div>
    </section>
  );
}