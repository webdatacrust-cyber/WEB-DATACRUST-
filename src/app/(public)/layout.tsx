import type { Metadata } from "next";
// import Link from "next/link";

// import { Button } from "@/components/ui/Button";
import {
    findBlockByIdentifier,
    getContentBlocks,
    resolveText,
} from "@/lib/public-content";

export const metadata: Metadata = {
    title: {
        default: "Startup Platform",
        template: "%s | Startup Platform",
    },
    description: "A modern platform for startup management and growth.",
};

export const dynamic = "force-dynamic";

/**
 * Public layout - Wrapper for all public-facing pages
 * Includes global footer and smooth scroll behavior
 * Optimized for mobile, tablet, and desktop viewports
 */
export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const blocks = await getContentBlocks();
    const siteNameBlock = findBlockByIdentifier(blocks, [
        "site-name",
        "brand",
        "company-name",
    ]);
    // const navCtaBlock = findBlockByIdentifier(blocks, [
    //     "nav-cta",
    //     "header-cta",
    // ]);
    const footerBlock = findBlockByIdentifier(blocks, [
        "footer",
        "footer-text",
        "footer-copy",
    ]);

    const siteName = resolveText(siteNameBlock, ["title", "name", "content"]);
    // const navCtaLabel = resolveText(navCtaBlock, ["label", "title", "name"]);
    // const navCtaHref =
    //     resolveText(navCtaBlock, ["href", "link", "url"]) ?? "/contact";
    const footerText = resolveText(footerBlock, [
        "body",
        "content",
        "description",
        "summary",
        "text",
    ]);

    return (
        <div className="min-h-screen bg-white text-slate-900 scroll-smooth">
            {/* Glass Header - Commented out header navigation */}
            {/* 
            <header className="sticky top-0 z-40 border-b border-white/10 bg-white/20 backdrop-blur-2xl transition-all duration-300">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-8 lg:px-12 py-4">
                   
                    <Link
                        href="/"
                        className="flex items-center gap-3 transition-all duration-300 group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-orange-500 to-orange-600 group-hover:shadow-lg group-hover:shadow-orange-500/40 transition-all duration-300" />
                        <span className="font-bold text-lg text-slate-900">
                            {siteName ?? <span className="sr-only">Home</span>}
                        </span>
                    </Link>

                   
                    <nav className="hidden items-center gap-8 text-sm md:flex">
                        {[
                            { href: "/", label: "Home" },
                            { href: "/services", label: "Services" },
                            { href: "/work", label: "Work" },
                            { href: "/about", label: "About" },
                            { href: "/contact", label: "Contact" },
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="font-medium text-slate-600 transition-colors duration-200 hover:text-orange-600"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    
                    {navCtaLabel ? (
                        <Button href={navCtaHref} variant="primary" size="sm">
                            {navCtaLabel}
                        </Button>
                    ) : null}
                </div>
            </header>
           */}

            {/* Main content area - All page content renders here */}
            <main className="flex flex-col">{children}</main>

            {/* Footer - Responsive design optimized for all screen sizes */}
            <footer className="bg-neutral-900 pt-16 sm:pt-24 md:pt-32 pb-8 sm:pb-12 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {/* Footer grid - responsive columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 md:gap-16 mb-16 sm:mb-24 md:mb-32">
                        {/* Brand section - spans 2 columns on md+ */}
                        <div className="md:col-span-2">
                            <h4 className="text-white text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
                                {siteName} WEB DATACRUST
                            </h4>
                            {footerText ? (
                                <p className="text-neutral-400 max-w-sm mb-6 sm:mb-8 text-sm sm:text-base leading-relaxed">
                                    {footerText}
                                </p>
                            ) : null}
                            {/* Social links - responsive sizing */}
                            <div className="flex gap-3 sm:gap-4">
                                {/* <div className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white cursor-pointer transition-all duration-300 shrink-0">
                                    <span className="material-symbols-outlined text-lg sm:text-xl">share</span>
                                </div> */}
                                <a
                                    className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-all duration-300 shrink-0"
                                    href="mailto:webdatacrust@gmail.com"
                                    aria-label="Email us on Gmail"
                                    title="web.datacrust@gmail.com"
                                >
                                    <span className="material-symbols-outlined text-lg sm:text-xl">Gmail</span>
                                </a>
                            </div>
                        </div>

                        {/* Platform links - responsive text sizing */}
                        <div>
                            <h5 className="text-white font-semibold mb-4 sm:mb-6 text-sm sm:text-base">
                                Platform
                            </h5>
                            <ul className="space-y-3 sm:space-y-4 text-neutral-400 text-xs sm:text-sm">
                                <li>
                                    <a className="hover:text-white transition-colors duration-200" href="#">
                                        Pricing
                                    </a>
                                </li>
                                <li>
                                    <a className="hover:text-white transition-colors duration-200" href="#">
                                        Integrations
                                    </a>
                                </li>
                                <li>
                                    <a className="hover:text-white transition-colors duration-200" href="#">
                                        Changelog
                                    </a>
                                </li>
                                <li>
                                    <a className="hover:text-white transition-colors duration-200" href="#">
                                        Roadmap
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Company links - responsive text sizing */}
                        <div>
                            <h5 className="text-white font-semibold mb-4 sm:mb-6 text-sm sm:text-base">
                                Company
                            </h5>
                            <ul className="space-y-3 sm:space-y-4 text-neutral-400 text-xs sm:text-sm">
                                <li>
                                    <a className="hover:text-white transition-colors duration-200" href="#">
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a className="hover:text-white transition-colors duration-200" href="#">
                                        Careers
                                    </a>
                                </li>
                                <li>
                                    <a className="hover:text-white transition-colors duration-200" href="#">
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a className="hover:text-white transition-colors duration-200" href="#">
                                        Privacy
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom section with brand text and links */}
                    <div className="border-t border-neutral-800 pt-8 sm:pt-12">
                        {/* Large brand text - responsive sizing and mobile-optimized */}
                        <h2 className="text-6xl sm:text-9xl md:text-[12rem] lg:text-[20rem] font-black text-neutral-800/70 select-none leading-none tracking-tighter whitespace-nowrap text-center -mb-8 sm:-mb-12 md:-mb-20 overflow-hidden">
                            WEB DATACRUST
                        </h2>

                        {/* Copyright and links - responsive layout */}
                        <div className="flex flex-col sm:flex-row justify-between items-center text-neutral-500 text-xs gap-4 sm:gap-0 mt-8 sm:mt-10">
                            <p>© {new Date().getFullYear()} All rights reserved.</p>
                            <div className="flex gap-6 sm:gap-8 text-center sm:text-left">
                                <a className="hover:text-white transition-colors duration-200 whitespace-nowrap" href="#">
                                    Status
                                </a>
                                <a className="hover:text-white transition-colors duration-200 whitespace-nowrap" href="#">
                                    API Reference
                                </a>
                                <a
                                    className="hover:text-white transition-colors duration-200 whitespace-nowrap inline-flex items-center gap-1"
                                    href="mailto:web.datacrust@gmail.com"
                                >
                                    <span
                                        className="material-symbols-outlined text-sm leading-none"
                                        aria-hidden="true"
                                    >
                                    </span>
                                    Gmail
                                </a>
                                <a className="hover:text-white transition-colors duration-200 whitespace-nowrap" href="#">
                                    Contact Sales
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
