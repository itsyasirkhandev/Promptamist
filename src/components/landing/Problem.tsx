import { FileQuestion, FolderClosed, Repeat, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollAnimation } from './ScrollAnimation';

const problems = [
  {
    icon: <Repeat className="h-8 w-8" />,
    title: "Endless Repetition",
    description: "You find yourself typing or pasting the same complex instructions into ChatGPT over and over again, wasting valuable time."
  },
  {
    icon: <FileQuestion className="h-8 w-8" />,
    title: "Lost Masterpieces",
    description: "You craft the perfect prompt that gives you amazing results, but it gets lost in your chat history, never to be found again."
  },
  {
    icon: <FolderClosed className="h-8 w-8" />,
    title: "Disorganized Workflow",
    description: "Your prompts are scattered across notes, documents, and spreadsheets, making it impossible to stay organized and efficient."
  }
];

export function Problem() {
  return (
    <section id="problem" className="py-24 bg-background scroll-mt-20">
      <ScrollAnimation className="container mx-auto px-4 sm:px-6 lg:px-8 duration-700">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-2 mb-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
             <AlertCircle className="w-4 h-4 mr-2" />
             <span className="text-sm font-semibold uppercase tracking-wider">The Problem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-headline">
            Sound Familiar? <span className="text-muted-foreground">The Prompt Trap.</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            If you're a power user of AI, you've felt the frustration. Your workflow is powerful, but your process is broken.
          </p>
        </div>
        
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem, i) => (
            <div 
                key={problem.title} 
                className="group p-8 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50 text-left"
                style={{animationDelay: `${i * 150}ms`}}
            >
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-background shadow-sm text-primary group-hover:scale-110 transition-transform duration-300">
                  {problem.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{problem.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                  {problem.description}
              </p>
            </div>
          ))}
        </div>
      </ScrollAnimation>
    </section>
  );
}