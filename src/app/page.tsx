import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Solution } from "@/components/landing/Solution";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";


export default function LandingPage() {
    return (
        <>
            <Hero />
            <Problem />
            <Solution />
            <Features />
            <Testimonials />
            <CTA />
        </>
    );
}
