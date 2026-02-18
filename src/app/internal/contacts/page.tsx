"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface ContactSubmission {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: string;
}

export default function ContactsPage() {
    const { data: session, status } = useSession();
    const [contacts, setContacts] = useState<ContactSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isAdmin = session?.user?.role === "ADMIN";

    useEffect(() => {
        if (status === "unauthenticated" || !isAdmin) {
            return;
        }

        fetchContacts();
    }, [status, isAdmin]);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await fetch("/api/internal/contacts");

            if (!res.ok) {
                throw new Error("Failed to fetch contact submissions");
            }

            const data = await res.json();
            setContacts(data.contacts);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const truncateMessage = (message: string, maxLength: number = 100) => {
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + "...";
    };

    if (status === "loading") {
        return <div className="p-6">Loading...</div>;
    }

    if (!isAdmin) {
        return (
            <div className="p-6 text-red-600">
                Access denied. Admin users only.
            </div>
        );
    }

    if (loading) {
        return <div className="p-6">Loading contact submissions...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                        Contact Management
                    </p>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Contact Submissions
                    </h1>
                </div>
                <div className="text-sm text-slate-500">
                    Total: {contacts.length}
                </div>
            </div>

            {error && (
                <div className="rounded bg-red-50 p-4 text-red-700">
                    Error: {error}
                </div>
            )}

            {contacts.length === 0 ? (
                <div className="rounded border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
                    No contact submissions yet
                </div>
            ) : (
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600"
                                    >
                                        Name
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600"
                                    >
                                        Email
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600"
                                    >
                                        Message
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600"
                                    >
                                        Submitted
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                                {contacts.map((contact) => (
                                    <tr
                                        key={contact.id}
                                        className="hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900">
                                                {contact.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <a
                                                href={`mailto:${contact.email}`}
                                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                {contact.email}
                                            </a>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600 max-w-md">
                                                {truncateMessage(contact.message)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-500">
                                                {formatDate(contact.createdAt)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
