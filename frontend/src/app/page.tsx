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
import ImportApplicationsDialog from "@/components/ImportApplicationsDialog";

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
    "Obtained Offer": "#06402B",
    "Rejected": "#FF1818"
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
        requestAnimationFrame(() => {
            document.getElementById("applications-overview")?.scrollIntoView({block: "start"});
        });
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
            if (applicationId !== null) {
                requestAnimationFrame(() => {
                    document.getElementById("applications")?.scrollIntoView({block: "start"});
                });
            }
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
        <main className="min-h-screen bg-white text-slate-600">
            <div className="h-screen">
                <div className="relative overflow-hidden w-full h-full">
                    <div className="h-full flex flex-col bg-[url('https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?q=80&w=686&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center bg-no-repeat">
                        <div className="flex flex-col h-full justify-center px-6 sm:px-12 lg:px-20 bg-slate-950/60">
                            <span className="text-5xl font-bold tracking-tight leading-tight text-white md:text-7xl">Simply Jobs</span>
                            <span className="mt-5 max-w-xl text-lg leading-relaxed text-slate-200 md:text-xl">Every job you applied for in one place</span>
                            <div className="mt-8 flex flex-col items-start gap-3">
                                <a
                                    className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/20"
                                    href="#applications-overview"
                                >
                                    See applications
                                </a>
                                <ImportApplicationsDialog provider="gmail" />
                                <ImportApplicationsDialog provider="linkedin" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section id="applications-overview" className="relative isolate">
                <div className="pointer-events-none absolute inset-0 hidden lg:block">
                    <div className="absolute inset-y-0 right-0 w-[35%] bg-[#008A60]"></div>
                    <div className="absolute bottom-0 right-[35%] h-[30%] w-[15%] bg-[#66B99F]"></div>
                    <div className="absolute bottom-0 right-0 h-[30%] w-[35%] bg-[#002D21]"></div>
                </div>
                <div
                    className="h-screen relative z-1 mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-10">
                    <div className="min-w-0 flex justify-center flex-col border-2 border-emerald-600 p-6 lg:justify-self-start">
                        <header className="border-b border-slate-200 pb-8">
                            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                                Job Application Tracker
                            </h1>

                            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                                Track your job applications, interviews, and offers.
                            </p>

                            <p className="mt-5 inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
                                Tracking {apps.length} job applications
                                {(normalizedSearch !== "" || statusFilter !== "All") &&
                                    `(${filteredApps.length} shown)`}
                            </p>
                        </header>

                        <form
                            onSubmit={handleAddApplication}
                            className="mt-8 space-y-6"
                        >
                            <h2 className="text-xl font-semibold">
                                {editingId === null ? "Add an application" : "Edit application"}
                            </h2>
                            <div className="grid grid-cols-1 gap-5">
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company</Label>
                                    <Input
                                        className="h-12 rounded-full border-slate-300 bg-white px-5 text-slate-900 placeholder:text-slate-400 focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20"
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
                                        className="h-12 rounded-full border-slate-300 bg-white px-5 text-slate-900 placeholder:text-slate-400 focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20"
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
                                        className="h-12 rounded-full border-slate-300 bg-white px-5 text-slate-900 placeholder:text-slate-400 focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20"
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
                                    className="h-12 min-w-48 rounded-2xl bg-emerald-700 px-8 text-white hover:bg-emerald-800"
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
                                        className="h-12 rounded-2xl border-slate-300 px-6 text-slate-700 hover:bg-slate-50"
                                        type="button"
                                        variant="outline"
                                        disabled={isMutating}
                                        onClick={() => {
                                            resetForm();
                                            requestAnimationFrame(() => {
                                                document.getElementById("applications")?.scrollIntoView({block: "start"});
                                            });
                                        }}
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
                    </div>

                    {!isLoading && !loadError && apps.length > 0 && (
                        <section
                            className="relative flex w-full min-w-0 flex-col self-center rounded-3-xl border-2 border-white bg-emerald-400 p-4 text-base font-semibold text-white shadow-2xl sm:p-6 lg:aspect-square">
                            <h2 className="text-xl font-semibold text-black self-center">
                                Application overview
                            </h2>

                            <div className="mt-4 h-[400px] w-full lg:h-auto lg:min-h-0 lg:flex-1">
                                <ResponsiveContainer width="100%" height="100%">
                                    <Sankey
                                        data={sankeyData}
                                        nodeWidth={18}
                                        nodePadding={40}
                                        margin={{top: 20, right: 20, bottom: 20, left: 20}}
                                        node={(props: Omit<ApplicationSankeyNodeProps, "onSelect">) => (
                                            <ApplicationSankeyNode {...props} onSelect={handleDiagramSelection}/>
                                        )}
                                        link={({
                                                   sourceX,
                                                   sourceY,
                                                   targetX,
                                                   targetY,
                                                   sourceControlX,
                                                   targetControlX,
                                                   linkWidth,
                                                   payload
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
                                                strokeOpacity={0.75}
                                            />
                                        )}
                                    >
                                        <Tooltip/>
                                    </Sankey>
                                </ResponsiveContainer>
                            </div>
                        </section>
                    )}
                </div>
            </section>
            {showApplications && (
                <section id="applications" className="grid min-h-screen scroll-mt-8 place-items-center bg-emerald-50/50 px-4 py-12 sm:px-6 lg:px-10">
                    <div className="w-full min-w-0 max-w-7xl rounded-3xl border-2 border-emerald-600 bg-white p-5 shadow-xl shadow-emerald-950/5 sm:p-8 lg:p-10">
                        <header className="flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                                    Showing {filteredApps.length} of {apps.length} applications
                                </h2>
                            </div>
                            <Button type="button" variant="outline" className="h-12 shrink-0 rounded-2xl border-slate-300 px-6 text-slate-700 hover:bg-slate-50 focus-visible:ring-emerald-600/20" onClick={() => setShowApplications(false)} >
                                Hide applications
                            </Button>
                        </header>
                        {!isLoading && !loadError && (
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Button type="button" variant={statusFilter === "All" ? "default" : "outline"}
                                        className={`h-11 rounded-full px-5 font-medium transition-colors focus-visible:ring-emerald-600/20 ${statusFilter === "All" ? "border border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800" : "border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"}`}
                                        onClick={() => handleDiagramSelection("Jobs applied to")}>
                                    Jobs applied to ({apps.length})
                                </Button>

                                {statusCounts.map(({status, count}) => (
                                    <Button key={status} type="button"
                                            variant={statusFilter === status ? "default" : "outline"}
                                            className={`h-11 rounded-full px-5 font-medium transition-colors focus-visible:ring-emerald-600/20 ${statusFilter === status ? "border border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800" : "border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900"}`}
                                            onClick={() => handleDiagramSelection(status)}>
                                        {status} ({count})
                                    </Button>
                                ))}
                            </div>
                        )}
                        <div className="mt-8 grid gap-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:p-6">
                            <div className="space-y-2">
                                <Label htmlFor="application-search">
                                    Search company or job title
                                </Label>
                                <Input
                                    className="h-12 rounded-full border-slate-300 bg-white px-5 text-slate-900 placeholder:text-slate-400 focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20"
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
                                    <SelectTrigger id="status-filter" className="h-12 w-full rounded-full border-slate-300 bg-white px-5 text-slate-900 focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20">
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-emerald-100 bg-white p-1 shadow-lg">
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
                                    className="h-12 w-full rounded-2xl border-slate-300 bg-white px-6 text-slate-700 hover:bg-slate-50 focus-visible:ring-emerald-600/20 md:w-auto"
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
                                <p className="mt-8 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 px-6 py-10 text-center text-slate-600">
                                    No applications match your search and filters.
                                </p>
                            )
                        }

                        <div
                            className="mt-8 scroll-mt-8 overflow-x-auto rounded-2xl border border-emerald-200 bg-white">
                            <table className="w-full min-w-[800px] text-left text-sm">
                                <caption className="sr-only">Applications</caption>

                                <thead className="bg-[#002D21] text-white">
                                <tr>
                                    <th scope="col" className="px-5 py-4 text-sm font-semibold">
                                        Company
                                    </th>
                                    <th scope="col" className="px-5 py-4 text-sm font-semibold">
                                        Job title
                                    </th>
                                    <th scope="col" className="px-5 py-4 text-sm font-semibold">
                                        Status
                                    </th>
                                    <th scope="col" className="px-5 py-4 text-sm font-semibold">
                                        Applied on
                                    </th>
                                    <th scope="col" className="px-5 py-4 text-sm font-semibold">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredApps.map((apps) => (
                                    <tr key={apps.id} className="border-t border-emerald-100 transition-colors even:bg-emerald-50/30 hover:bg-emerald-50">
                                        <td className="px-5 py-5 font-semibold text-slate-900">{apps.company}</td>
                                        <td className="px-5 py-5 text-slate-600">{apps.jobTitle}</td>
                                        <td className="px-5 py-5">
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
                                                <SelectTrigger className="h-10 w-44 rounded-full border-emerald-200 bg-white px-4 text-sm font-medium text-emerald-900 focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20">
                                                    <SelectValue/>
                                                </SelectTrigger>

                                                <SelectContent className="rounded-2xl border-emerald-100 bg-white p-1 shadow-lg">
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
                                        <td className="whitespace-nowrap px-5 py-5 tabular-nums text-slate-600">{apps.appliedOn}</td>
                                        <td className="px-5 py-5">
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-10 rounded-xl border-emerald-200 bg-white px-4 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 focus-visible:ring-emerald-600/20"
                                                    disabled={isMutating || editingId !== null}
                                                    onClick={() => handleStartEdit(apps)}
                                                >
                                                    {editingId === apps.id ? "Editing..." : "Edit"}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="h-10 rounded-xl border border-red-200 bg-red-50 px-4 text-red-700 shadow-none hover:bg-red-100 focus-visible:ring-red-600/20"
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
                    </div>
                </section>
            )}
        </main>
    );
}