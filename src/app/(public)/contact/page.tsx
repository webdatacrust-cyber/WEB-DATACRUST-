import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { warmGradientLight } from "@/lib/styles/gradients";
import { generatePageMetadata } from "@/lib/seo";
import { ContactForm } from "./ContactForm";

export async function generateMetadata(): Promise<Metadata> {
    return generatePageMetadata("CONTACT");
}

/**
 * Contact page - Form submission with validation
 * Clean, centered layout optimized for form completion
 */
export default async function ContactPage() {
    return (
        <div className="bg-white scroll-smooth">
            {/* Hero Section - Page introduction */}
            <Section className={`${warmGradientLight} py-16 sm:py-24 md:py-32`}>
                <div className="mx-auto max-w-3xl px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                            Get in Touch
                        </h1>
                        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-600 leading-relaxed">
                            Have a question or want to work together? We'd love to hear from you.
                        </p>
                    </div>

                    {/* Contact Form */}
                    <ContactForm />
                </div>
            </Section>
        </div>
    );
}
