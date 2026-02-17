import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ScrollAnimation } from './ScrollAnimation';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-24 pb-32 lg:pt-36 lg:pb-40">
      {/* Background Gradients */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollAnimation className="flex flex-col items-center text-center duration-1000">
          
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium rounded-full bg-secondary/50 backdrop-blur-sm border border-secondary-foreground/10 text-secondary-foreground">
            <Sparkles className="w-4 h-4 mr-2 inline-block text-primary" />
            The Future of Prompt Engineering
          </Badge>

          <h1 className="max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground font-headline leading-[1.1]">
            Stop Repeating Yourself <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
               to Artificial Intelligence.
            </span>
          </h1>
          
          <p className="mt-8 max-w-2xl text-lg sm:text-xl text-foreground/80 leading-relaxed">
            Promptamist is your personal command center for AI prompts. Save, organize, and reuse your best prompts as powerful templates. 
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" className="rounded-full h-12 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow" asChild>
              <Link href="/auth">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-base bg-background/50 backdrop-blur-sm hover:bg-background/80 hover:text-foreground" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>

          <div className="mt-20 relative w-full max-w-5xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-20" />
            <div className="relative rounded-xl border border-border/50 bg-background/50 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
                 <Image
                    src="https://i.postimg.cc/cLZmPt1f/Promtamist-dashboard-page.png"
                    alt="Promptamist Dashboard"
                    width={1200}
                    height={800}
                    className="w-full h-auto"
                    priority
                  />
            </div>
          </div>

        </ScrollAnimation>
      </div>
    </section>
  );
}
