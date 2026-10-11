"use client";

import { Dialog } from "radix-ui";
import { Button } from "@/components/ui/button";

type ImportApplicationsDialogProps = {
    provider: "gmail" | "linkedin";
}

export default function ImportApplicationsDialog({ provider }: ImportApplicationsDialogProps) {
    const providerName = provider === "gmail" ? "Gmail" : "LinkedIn";

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <Button type="button" className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/20">
                    Import applications from {providerName}
                </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/60" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border-2 border-emerald-600 bg-white p-6 shadow-2xl sm:p-8">
                    <Dialog.Title className="text-2xl font-semibold tracking-tight text-slate-900">
                        Import from {providerName}
                    </Dialog.Title>
                    <Dialog.Description className="mt-3 text-base leading-relaxed text-slate-600">
                        { provider === "gmail" ? "Connect your Google account to find past and future job applications from your inbox." : "Use your signed-in LinkedIn browser to collect job applications visible in your tracker." }
                    </Dialog.Description>
                    <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-100 p-4">
                        <p className="text-sm leading-relaxed text-emerald-900">
                            Review the results and fill in any missing details before adding applications to this tracker.
                        </p>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <Dialog.Close asChild>
                            <Button type="button" variant="outline" className="h-12 rounded-2xl border-slate-300 px-6 text-slate-700 hover:bg-slate-50">
                                Close
                            </Button>
                        </Dialog.Close>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}