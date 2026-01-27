import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollAnimation } from './ScrollAnimation';

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background with Gradient */}
      <div className="absolute inset-0 bg-primary z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-900 opacity-90" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      <ScrollAnimation className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center duration-700">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center justify-center p-3 mb-8 rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/20 shadow-xl">
             <Zap className="w-6 h-6 mr-2 fill-yellow-400 text-yellow-400" />
             <span className="font-semibold">Join hundreds of prompt engineers</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-headline mb-6">
            Ready to Supercharge <br /> Your AI Workflow?
          </h2>
          
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Start building your personal prompt library today. It's free, intuitive, and designed for power users like you.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button size="lg" className="rounded-full h-14 px-8 text-lg bg-white text-primary hover:bg-white/90 shadow-xl shadow-black/10" asChild>
                <Link href="/auth">
                    Get Started for Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </Button>
            <p className="text-white/60 text-sm mt-4 sm:mt-0 sm:ml-4">
                No credit card required.
            </p>
          </div>
        </div>
      </ScrollAnimation>
    </section>
  );
}