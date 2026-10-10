"use client";

import { useEffect, useState, type SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ResponsiveContainer, Sankey, Tooltip } from "recharts";

type JobApplication = {
    id: number;
    company: string;
    jobTitle: string;
    status: "Applied" | "Interview Pending" | "Obtained Offer" | "Rejected";
    appliedOn: string;
};

const APPLICATION_STATUSES: JobApplication["status"][] = [
    "Applied",
    "Interview Pending",
    "Obtained Offer",
    "Rejected",
];

type ApplicationSankeyNodeProps = {
    x: number;
    y: number;
    width: number;
    height: number;
    index: number;
    payload: {
        name: string;
        value: number;
    };
    onSelect: (name: string) => void;
};

const APPLICATION_NODE_COLORS: Record<string, string> = {
    "Jobs applied to": "#000000",
    "Applied": "#0284C7",
    "Interview Pending": "#FFBF00",
    "Obtained Offer": "#80EF80",
    "Rejected": "#C30F16"
};

// AI generated snippet
function ApplicationSankeyNode({x, y, width, height, index, payload, onSelect}: ApplicationSankeyNodeProps) {
    const isRoot = index === 0;
    const labelX = isRoot ? x + width + 12 : x - 12;
    const labelY = y + height / 2;
    const nodeColor = APPLICATION_NODE_COLORS[payload.name];

    return (
        <g role="button" tabIndex={0} className="cursor-pointer" onClick={() => onSelect(payload.name)} >
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx={3}
                fill={nodeColor}
            />
            <text
                x={labelX}
                y={labelY - 6}
                textAnchor={isRoot ? "start" : "end"}
                fontSize={13}
                fontWeight={600}
                fill="#000000"
            >
                {payload.name}
                <tspan
                    x={labelX}
                    dy={20}
                    fontSize={12}
                    fontWeight={400}
                    fill="#000000"
                >
                    {payload.value}
                </tspan>
            </text>
        </g>
    );
}

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
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<
        JobApplication["status"] | "All"
    >("All");
    const [showApplications, setShowApplications] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [statusError, setStatusError] = useState("");
    const [error, setError] = useState("");

    const isMutating = isSaving || updatingId !== null || deletingId !== null;
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const filteredApps = apps.filter((application) => {
        const matchesSearch =
            application.company.toLowerCase().includes(normalizedSearch) ||
            application.jobTitle.toLowerCase().includes(normalizedSearch);
        const matchesStatus =
            statusFilter === "All" || application.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const statusCounts = APPLICATION_STATUSES.map((status) => ({
        status,
        count: apps.filter((application) => application.status === status).length
    }));

    const chartStatuses = statusCounts.filter(({count}) => count > 0);

    const sankeyData = {
        nodes: [
            { name: "Jobs applied to" }, ...chartStatuses.map(({status}) => ({ name: status }))
        ],
        links: chartStatuses.map(({count}, index) => ({
            source: 0,
            target: index + 1,
            value: count
        }))
    };

    useEffect(() => {
        if (showApplications) {
            document.getElementById("applications")?.scrollIntoView({block: "start"});
        }
    }, [showApplications]);

    useEffect(() => {
        let ignore = false;

        async function loadApplications() {
            try {
                const response = await fetch("/api/applications", {
                    cache: "no-store",
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
                    setLoadError(
                        "Could not load applications. Refresh page to try again."
                    );
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

    function resetForm() {
        setEditingId(null);
        setCompany("");
        setJobTitle("");
        setAppliedOn("");
        setError("");
    }

    function handleStartEdit(application: JobApplication) {
        if (isMutating || editingId !== null) {
            return;
        }

        setEditingId(application.id);
        setCompany(application.company);
        setJobTitle(application.jobTitle);
        setAppliedOn(application.appliedOn);
        setError("");
        setStatusError("");
        setDeleteError("");
    }

    async function handleAddApplication(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isLoading || isMutating || loadError) {
            return;
        }

        setError("");
        setStatusError("");
        setDeleteError("");

        const trimmedCompany = company.trim();
        const trimmedJobTitle = jobTitle.trim();

        if (!trimmedCompany || !trimmedJobTitle || !appliedOn) {
            setError("Enter a company, job title, and application date.");
            return;
        }

        const applicationId = editingId;
        const url =
            applicationId === null
                ? "/api/applications"
                : `/api/applications/${applicationId}`;

        setIsSaving(true);

        try {
            const response = await fetch(url, {
                method: applicationId === null ? "POST" : "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    company: trimmedCompany,
                    jobTitle: trimmedJobTitle,
                    appliedOn,
                }),
            });

            if (!response.ok) {
                setError(
                    response.status === 400
                        ? "Please check all fields and try again."
                        : response.status === 404
                            ? "This application could not be found. Refresh the page to reload your applications."
                            : "Could not save the application. Please try again."
                );
                return;
            }

            const savedApplication: JobApplication = await response.json();

            setApplications((current) =>
                applicationId === null
                    ? [savedApplication, ...current]
                    : current.map((application) =>
                        application.id === savedApplication.id
                            ? savedApplication
                            : application
                    )
            );
            resetForm();
        } catch {
            setError("Could not save the application. Please try again.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleStatusChange(
        applicationId: number,
        status: JobApplication["status"]
    ) {
        if (isMutating) {
            return;
        }

        setUpdatingId(applicationId);
        setStatusError("");
        setDeleteError("");

        try {
            const response = await fetch(
                `/api/applications/${applicationId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status }),
                }
            );
            if (!response.ok) {
                setStatusError(
                    response.status === 404
                        ? "This application could not be found. Refresh the page to reload your applications"
                        : "Could not update the status. Please try again."
                );
                return;
            }

            const updatedApplication: JobApplication = await response.json();

            setApplications((current) =>
                current.map((application) =>
                    application.id === updatedApplication.id
                        ? updatedApplication
                        : application
                )
            );
        } catch {
            setStatusError("Could not update the status. Please try again.");
        } finally {
            setUpdatingId(null);
        }
    }

    async function handleDeleteApplication(application: JobApplication) {
        if (isMutating) {
            return;
        }

        const confirmed = window.confirm(
            `Delete your ${application.jobTitle} application at ${application.company}? This permanently removes it from your tracker.`
        );

        if (!confirmed) {
            return;
        }

        setDeletingId(application.id);
        setDeleteError("");
        setStatusError("");

        try {
            const response = await fetch(`/api/applications/${application.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                setDeleteError(
                    response.status === 404
                        ? "This application could not be found. Refresh the page to reload your applications."
                        : "Could not delete the application. Please try again."
                );
                return;
            }

            setApplications((current) =>
                current.filter((item) => item.id !== application.id)
            );

            if (editingId === application.id) {
                resetForm();
            }
        } catch {
            setDeleteError("Could not delete the application. Please try again.");
        } finally {
            setDeletingId(null);
        }
    }

    function handleDiagramSelection(name: string) {
        const nextFilter = name === "Jobs applied to" ? "All" : APPLICATION_STATUSES.find((status) => status === name);

        if (!nextFilter) {
            return;
        }

        setSearchQuery("");
        setStatusFilter(nextFilter);
        setShowApplications(true);

        if (showApplications) {
            document.getElementById("applications")?.scrollIntoView({block: "start"});
        }
    }
    return (
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <div className="h-screen">
                <div className="relative overflow-hidden w-full h-full">
                    <div className="h-full flex flex-col bg-[url('https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?q=80&w=686&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center bg-no-repeat">
                        <div className="flex flex-col h-full justify-center px-6 sm:px-12 lg:px-20 bg-slate-950/60">
                            <span className="text-5xl font-bold tracking-tight leading-tight text-white md:text-7xl">Simply Jobs</span>
                            <span className="mt-5 max-w-xl text-lg leading-relaxed text-slate-200 md:text-xl">Every job you applied for in one place</span>
                            <div className="mt-8 flex flex-col items-start gap-3">
                                <a
                                    className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/20"
                                    href="#applications"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        handleDiagramSelection("Jobs applied to");
                                    }}
                                >
                                    See applications
                                </a>
                                <a
                                    className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/20"
                                    href="#"
                                >
                                    Import all applications tied to Gmail
                                </a>
                                <a
                                    className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/20"
                                    href="#"
                                >
                                    Import all applications tied to Outlook
                                </a>
                                <a
                                    className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/20"
                                    href="#"
                                >
                                    Import all applications tied to LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-6 py-12">
                <h1 className="text-3xl font-bold">Job Application Tracker</h1>

                <p className="mt-3 mb-2 text-slate-600">
                    Track your job applications, interviews, and offers.
                </p>

                <p className="mt-5 text-slate-600">
                    Tracking {apps.length} job applications
                    {(normalizedSearch !== "" || statusFilter !== "All") &&
                        `(${filteredApps.length} shown)`}
                </p>

                <form
                    onSubmit={handleAddApplication}
                    className="mt-10 space-y-4 rounded-lg border border-slate-200 bg-white p-6"
                >
                    <h2 className="text-xl font-semibold">
                        {editingId === null ? "Add an application" : "Edit application"}
                    </h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                value={company}
                                onChange={(event) => setCompany(event.target.value)}
                                placeholder="Example: Spotify"
                                maxLength={255}
                                disabled={isMutating}
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
                                disabled={isMutating}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="appliedOn">Date application submitted</Label>
                            <Input
                                id="appliedOn"
                                type="date"
                                value={appliedOn}
                                onChange={(event) => setAppliedOn(event.target.value)}
                                disabled={isMutating}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <p role="alert" className="text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            disabled={isLoading || isMutating || Boolean(loadError)}
                        >
                            {isSaving
                                ? "Saving..."
                                : editingId === null
                                    ? "Add Application"
                                    : "Save changes"}
                        </Button>
                        {editingId !== null && (
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isMutating}
                                onClick={resetForm}
                            >
                                Cancel editing
                            </Button>
                        )}
                    </div>
                </form>

                {statusError && (
                    <p role="alert" className="mt-4 text-red-600">
                        {statusError}
                    </p>
                )}

                {deleteError && (
                    <p role="alert" className="mt-4 text-red-600">
                        {deleteError}
                    </p>
                )}

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

                {!isLoading && !loadError && apps.length > 0 && (
                    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
                        <h2 className="text-xl font-semibold">
                            Application overview
                        </h2>

                        <div className="mt-4 h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={600}>
                                <Sankey
                                    data={sankeyData}
                                    nodeWidth={18}
                                    nodePadding={40}
                                    margin={{top: 20, right: 20, bottom: 20, left: 20}}
                                    node={(props: Omit<ApplicationSankeyNodeProps, "onSelect">) => (
                                        <ApplicationSankeyNode {...props} onSelect={handleDiagramSelection} />
                                    )}
                                    link={({
                                        sourceX, sourceY, targetX, targetY, sourceControlX, targetControlX, linkWidth, payload
                                    }) => (
                                        <path
                                            d={`
                                                M ${sourceX},${sourceY}
                                                C ${sourceControlX},${sourceY}
                                                  ${targetControlX},${targetY}
                                                  ${targetX},${targetY}
                                            `}
                                            fill="none"
                                            stroke={APPLICATION_NODE_COLORS[payload.target.name]}
                                            strokeWidth={linkWidth}
                                            strokeOpacity={0.4}
                                        />
                                    )}
                                >
                                        <Tooltip />
                                </Sankey>
                            </ResponsiveContainer>
                        </div>
                    </section>
                )}
                {!isLoading && !loadError && (
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Button type="button" variant={statusFilter === "All" ? "default" : "outline"} aria-pressed={statusFilter === "All"} onClick={() => handleDiagramSelection("Jobs applied to")} >
                            Jobs applied to ({apps.length})
                        </Button>

                        {statusCounts.map(({status, count}) => (
                            <Button key={status} type="button" variant={statusFilter === status ? "default": "outline"} onClick={() => handleDiagramSelection(status)} >
                                {status} ({count})
                            </Button>
                        ))}
                    </div>
                )}
                {showApplications && (
                    <section id="applications" className="mt-8 scroll-mt-8">
                        <Button type="button" variant="outline" onClick={() => setShowApplications(false)}>Hide
                            applications</Button>
                        <div className="mt-10 grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="application-search">
                                    Search company or job title
                                </Label>
                                <Input
                                    id="application-search"
                                    type="search"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Search applications..."
                                    disabled={isLoading || Boolean(loadError)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status-filter">Filter by status</Label>
                                <Select
                                    value={statusFilter}
                                    disabled={isLoading || Boolean(loadError)}
                                    onValueChange={(value) => {
                                        if (value === "All") {
                                            setStatusFilter("All");
                                            return;
                                        }
                                        const status = APPLICATION_STATUSES.find(
                                            (option) => option === value
                                        );
                                        if (status) {
                                            setStatusFilter(status);
                                        }
                                    }}
                                >
                                    <SelectTrigger id="status-filter" className="w-full">
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All statuses</SelectItem>
                                        {APPLICATION_STATUSES.map((status) => (
                                            <SelectItem key={status} value={status}>
                                                {status}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={searchQuery === "" && statusFilter === "All"}
                                    onClick={() => {
                                        setSearchQuery("");
                                        setStatusFilter("All");
                                    }}
                                >
                                    Clear filters
                                </Button>
                            </div>
                        </div>
                        {!isLoading &&
                            !loadError &&
                            apps.length > 0 &&
                            filteredApps.length === 0 && (
                                <p className="text-slate-600">
                                    No applications match your search and filters.
                                </p>
                            )
                        }

                        <div className="mt-10 scroll-mt-8 overflow-x-auto rounded-lg border border-slate-200 bg-white">
                            <table className="w-full text-left">
                                <caption className="sr-only">Applications</caption>

                                <thead className="bg-slate-100">
                                <tr>
                                    <th scope="col" className="p-4">
                                        Company
                                    </th>
                                    <th scope="col" className="p-4">
                                        Job title
                                    </th>
                                    <th scope="col" className="p-4">
                                        Status
                                    </th>
                                    <th scope="col" className="p-4">
                                        Applied on
                                    </th>
                                    <th scope="col" className="p-4">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredApps.map((apps) => (
                                    <tr key={apps.id} className="border-t border-slate-200">
                                        <td className="p-4">{apps.company}</td>
                                        <td className="p-4">{apps.jobTitle}</td>
                                        <td className="p-4">
                                            <Select
                                                value={apps.status}
                                                disabled={updatingId !== null}
                                                onValueChange={(value) => {
                                                    const status = APPLICATION_STATUSES.find(
                                                        (option) => option === value
                                                    );
                                                    if (status) {
                                                        void handleStatusChange(apps.id, status);
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className="w-36">
                                                    <SelectValue/>
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {APPLICATION_STATUSES.map((status) => (
                                                        <SelectItem key={status} value={status}>
                                                            {status}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            {updatingId === apps.id && (
                                                <p role="status" className="mt-1 text-xs text-slate-600">
                                                    Saving status...
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-4">{apps.appliedOn}</td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={isMutating || editingId !== null}
                                                    onClick={() => handleStartEdit(apps)}
                                                >
                                                    {editingId === apps.id ? "Editing..." : "Edit"}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    disabled={isMutating}
                                                    onClick={() => {
                                                        void handleDeleteApplication(apps);
                                                    }}
                                                >
                                                    {deletingId === apps.id ? "Deleting..." : "Delete"}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
