"use client";

import { useState, type SubmitEvent } from "react";
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

const initialApps: JobApplication[] = [
    {
        id: 1,
        company: "Riot Games",
        jobTitle: "Staff Software Engineer",
        status: "Applied",
        appliedOn: "2026-10-01"
    },
    {
        id: 2,
        company: "IBM",
        jobTitle: "Cisco Network Services Specialist",
        status: "Interview Pending",
        appliedOn: "2026-09-01"
    }
];


export default function Home() {
    const [apps, setApps] = useState<JobApplication[]>(initialApps);
    const [company, setCompany] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [appliedOn, setAppliedOn] = useState("");
    const [error, setError] = useState("");

    function handleAddApplication(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedCompany = company.trim();
        const trimmedJobTitle = jobTitle.trim();

        if (!trimmedCompany || !trimmedJobTitle || !appliedOn) {
            setError("Enter a company, job title, and application date.");
            return;
        }

        setApps((current) => [
            ...current,
            {
                id: Math.max(0, ...current.map((item) => item.id)) + 1,
                company: trimmedCompany,
                jobTitle: trimmedJobTitle,
                status: "Applied",
                appliedOn
            }
        ]);

        setCompany("");
        setJobTitle("");
        setAppliedOn("");
        setError("");
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
                        required
                    />
                </div>
            </div>

            {error && (
                <p role="alert" className="text-sm text-red-600">
                    {error}
                </p>
            )}

            <Button type="submit">Add Application</Button>
        </form>
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