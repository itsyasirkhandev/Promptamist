import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot } from "lucide-react";

export function Hero() {
  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
            <div className="mb-6">
                <Bot className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground font-headline">
                Stop Repeating Yourself to AI.
            </h1>
            <p className="mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground">
                Promptamist is your personal command center for AI prompts. Save, organize, and reuse your best prompts as powerful templates. Never lose a great prompt again.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button size="lg" asChild>
                    <Link href="/auth">
                        Get Started for Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
                100% Free. Forever.
            </p>
        </div>
      </div>
    </section>
  );
}
