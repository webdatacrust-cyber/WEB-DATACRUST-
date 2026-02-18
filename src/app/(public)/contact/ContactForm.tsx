"use client";

import { useState } from "react";

export function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [companyName, setCompanyName] = useState(""); // Honeypot field
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    // Client-side validation
    const nameError = name.length > 0 && name.trim().length === 0 ? "Name is required" : "";
    const emailError = email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Invalid email format" : "";
    const messageError = message.length > 0 && message.trim().length < 10 ? "Message must be at least 10 characters" : "";

    const isFormValid =
        name.trim().length > 0 &&
        email.trim().length > 0 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
        message.trim().length >= 10;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!isFormValid) {
            setErrorMessage("Please fix all validation errors");
            setSubmitStatus("error");
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus("idle");
        setErrorMessage("");

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    message: message.trim(),
                    companyName, // Honeypot field
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to submit form");
            }

            setSubmitStatus("success");

            // Reset form
            setName("");
            setEmail("");
            setMessage("");
            setCompanyName("");

            // Reset success message after 5 seconds
            setTimeout(() => {
                setSubmitStatus("idle");
            }, 5000);
        } catch (error) {
            setSubmitStatus("error");
            setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-900 mb-2">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 rounded-lg border ${nameError
                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                : "border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                            } focus:outline-none focus:ring-2 transition-colors disabled:bg-slate-50 disabled:cursor-not-allowed`}
                        placeholder="Your full name"
                    />
                    {nameError && (
                        <p className="mt-1 text-sm text-red-600">{nameError}</p>
                    )}
                </div>

                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-2">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        className={`w-full px-4 py-3 rounded-lg border ${emailError
                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                : "border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                            } focus:outline-none focus:ring-2 transition-colors disabled:bg-slate-50 disabled:cursor-not-allowed`}
                        placeholder="your.email@example.com"
                    />
                    {emailError && (
                        <p className="mt-1 text-sm text-red-600">{emailError}</p>
                    )}
                </div>

                {/* Message Field */}
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-900 mb-2">
                        Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={isSubmitting}
                        rows={5}
                        className={`w-full px-4 py-3 rounded-lg border ${messageError
                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                : "border-slate-300 focus:border-orange-500 focus:ring-orange-500"
                            } focus:outline-none focus:ring-2 transition-colors resize-y disabled:bg-slate-50 disabled:cursor-not-allowed`}
                        placeholder="Tell us how we can help you..."
                    />
                    {messageError && (
                        <p className="mt-1 text-sm text-red-600">{messageError}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-500">
                        {message.length}/10 characters minimum
                    </p>
                </div>

                {/* Honeypot Field - Hidden from users */}
                <div className="hidden" aria-hidden="true">
                    <label htmlFor="companyName">Company Name</label>
                    <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className="w-full px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Sending..." : "Send Message"}
                </button>

                {/* Status Messages */}
                {submitStatus === "success" && (
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-sm font-medium text-green-800">
                            Thank you for your message! We&apos;ll get back to you soon.
                        </p>
                    </div>
                )}

                {submitStatus === "error" && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-sm font-medium text-red-800">
                            {errorMessage || "Failed to send message. Please try again."}
                        </p>
                    </div>
                )}
            </form>
        </div>
    );
}
