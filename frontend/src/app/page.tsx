type JobApplication = {
    id: number;
    company: string;
    jobTitle: string;
    status: "Applied" | "Interview Pending" | "Obtained Offer" | "Rejected";
    appliedOn: string;
};

const apps: JobApplication[] = [
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