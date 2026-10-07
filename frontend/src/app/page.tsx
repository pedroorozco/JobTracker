"use client";

import { useEffect, useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type JobApplication = {
    id: number;
    company: string;
    jobTitle: string;
    status: "Applied" | "Interview Pending" | "Obtained Offer" | "Rejected";
    appliedOn: string;
};


export default function Home() {
    // Applications and API request states
    const [apps, setApplications] = useState<JobApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [loadError, setLoadError] = useState("");

    // Form values and submission errors
    const [company, setCompany] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [appliedOn, setAppliedOn] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;

        async function loadApplications() {
            try {
                const response = await fetch("/api/applications", {
                    cache: "no-store"
                });

                if (!response.ok) {
                    throw new Error("Application request failed");
                }

                const data: JobApplication[] = await response.json();

                if (!ignore) {
                    setApplications(data);
                    setLoadError("");
                }
            } catch {
                if (!ignore) {
                    setLoadError("Could not load applications. Refresh page to try again.");
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        void loadApplications();

        return () => {
            ignore = true;
        };
    }, []);

    async function handleAddApplication(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isLoading || isSaving || loadError) {
            return;
        }

        setError("");

        const trimmedCompany = company.trim();
        const trimmedJobTitle = jobTitle.trim();

        if (!trimmedCompany || !trimmedJobTitle || !appliedOn) {
            setError("Enter a company, job title, and application date.");
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch("/api/applications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    company: trimmedCompany,
                    jobTitle: trimmedJobTitle,
                    appliedOn
                })
            });

            if (!response.ok) {
                setError(
                    response.status === 400 ? "Please check all fields and try again." : "Could not save the application. Please try again."
                );
                return;
            }

            const savedApplication: JobApplication = await response.json();

            setApplications((current) => [savedApplication, ...current]);

            setCompany("");
            setJobTitle("");
            setAppliedOn("");
        } catch {
            setError("Could not save the application. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }
  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-900">
      <h1 className="text-3xl font-bold">
        Job Application Tracker
      </h1>

      <p className="mt-3 mb-2 text-slate-600">
        Track your job applications, interviews, and offers.
      </p>

        <p className="mt-5 text-slate-600">
            Tracking {apps.length} job applications
        </p>

        <form onSubmit={handleAddApplication} className="mt-10 space-y-4 rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold"> Add an application</h2>
            <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                        id="company"
                        value={company}
                        onChange={(event) => setCompany(event.target.value)}
                        placeholder="Example: Spotify"
                        maxLength={255}
                        disabled={isSaving}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                        id="jobTitle"
                        value={jobTitle}
                        onChange={(event) => setJobTitle(event.target.value)}
                        placeholder="Example: Applications Developer I"
                        maxLength={255}
                        disabled={isSaving}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="appliedOn">Date application submitted</Label>
                    <Input
                        id="appliedON"
                        type="date"
                        value={appliedOn}
                        onChange={(event) => setAppliedOn(event.target.value)}
                        disabled={isSaving}
                        required
                    />
                </div>
            </div>

            {error && (
                <p role="alert" className="text-sm text-red-600">
                    {error}
                </p>
            )}

            <Button type="submit" disabled={isLoading || isSaving || Boolean(loadError)}>{isSaving ? "Saving..." : "Add Application"}</Button>
        </form>

        {isLoading && (
            <p role="status" className="text-slate-600">
                Loading Applications...
            </p>
        )}

        {loadError && (
            <p role="alert" className="text-red-600">
                {loadError}
            </p>
        )}

        {!isLoading && !loadError && apps.length === 0 && (
            <p className="text-slate-600">
                No applications yet. Add one using the form.
            </p>
        )}

        <div className="mt-10 overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-left">
                <caption className="sr-only">
                    Applications
                </caption>

                <thead className="bg-slate-100">
                <tr>
                    <th scope="col" className="p-4">Company</th>
                    <th scope="col" className="p-4">Job title</th>
                        <th scope="col" className="p-4">Status</th>
                        <th scope="col" className="p-4">Applied on</th>
                    </tr>
                </thead>
                <tbody>
                {apps.map((apps) => (
                    <tr key={apps.id} className="border-t border-slate-200">
                        <td className="p-4">{apps.company}</td>
                        <td className="p-4">{apps.jobTitle}</td>
                        <td className="p-4">{apps.status}</td>
                        <td className="p-4">{apps.appliedOn}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    </main>
  );
}