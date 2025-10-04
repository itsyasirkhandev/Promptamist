
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Solution } from "@/components/landing/Solution";
import { Features } from "@/components/landing/Features";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { AppLayout } from "@/components/AppLayout";


export default function LandingPage() {
    return (
        <AppLayout>
            <Hero />
            <Problem />
            <Solution />
            <Features />
            <Testimonials />
            <CTA />
            <Footer />
        </AppLayout>
    );
}
