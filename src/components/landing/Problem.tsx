import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, FolderClosed, Repeat } from "lucide-react";

const problems = [
  {
    icon: <Repeat className="h-8 w-8 text-primary" />,
    title: "Endless Repetition",
    description: "You find yourself typing or pasting the same complex instructions into ChatGPT over and over again, wasting valuable time."
  },
  {
    icon: <FileQuestion className="h-8 w-8 text-primary" />,
    title: "Lost Masterpieces",
    description: "You craft the perfect prompt that gives you amazing results, but it gets lost in your chat history, never to be found again."
  },
  {
    icon: <FolderClosed className="h-8 w-8 text-primary" />,
    title: "Disorganized Workflow",
    description: "Your prompts are scattered across notes, documents, and spreadsheets, making it impossible to stay organized and efficient."
  }
];

export function Problem() {
  return (
    <section id="problem" className="py-16 sm:py-24 bg-muted/50 scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-headline">
            Sound Familiar? The Prompt Trap.
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            If you're a power user of AI, you've felt the frustration. Your workflow is powerful, but your process is broken.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem) => (
            <Card key={problem.title} className="text-center">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  {problem.icon}
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-bold font-headline">{problem.title}</h3>
                <p className="mt-2 text-muted-foreground">
                  {problem.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}