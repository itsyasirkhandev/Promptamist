import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Sarah L.",
    title: "Content Creator",
    image: "https://i.pravatar.cc/150?img=1",
    quote: "Promptamist has been a game-changer for my content creation workflow. I've saved hours by turning my best prompts into templates. I can't imagine going back."
  },
  {
    name: "Mike R.",
    title: "Developer",
    image: "https://i.pravatar.cc/150?img=3",
    quote: "As a developer, I'm constantly using AI for code generation and debugging. Promptamist keeps my go-to prompts organized and easily accessible. It's a simple tool that solves a huge problem."
  },
  {
    name: "Jessica T.",
    title: "Marketing Manager",
    image: "https://i.pravatar.cc/150?img=5",
    quote: "This is the prompt tool I didn't know I needed. The templating feature is brilliant for creating ad copy variations. Plus, it's free! Highly recommended."
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-background scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight font-headline">
            Loved by AI Power Users
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Don't just take our word for it. Here's what people are saying about Promptamist.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-1 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="flex flex-col">
              <CardContent className="pt-6 flex-grow">
                <p className="text-muted-foreground">"{testimonial.quote}"</p>
              </CardContent>
              <div className="p-6 pt-0 flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={testimonial.image} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}