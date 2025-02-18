import { useQuery } from "@tanstack/react-query";
import { useFilter } from "../App";
import { githubApi } from "../services/github";
import { DateRangePicker } from "../components/ui/date-range-picker";
import { OpenPRsResponse } from "../types/github";
import { format } from "date-fns";

export function OpenPRs() {
  const { filter, setFilter, resetToDefault } = useFilter();

  // Fetch open PRs
  const { data: openPRsData, isLoading } = useQuery<OpenPRsResponse>({
    queryKey: ["open-prs", filter],
    queryFn: () => githubApi.getOpenPRs(filter),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 text-left">Open Pull Requests</h1>
          {openPRsData && (
            <p className="text-sm mt-1 flex items-center space-x-1">
              <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-medium">
                {openPRsData.totalOpenPRs}
              </span>
              <span className="text-gray-500">open pull requests across</span>
              <span className="bg-gray-50 text-gray-700 px-2 py-0.5 rounded-md font-medium">
                {openPRsData.repositories.length}
              </span>
              <span className="text-gray-500">repositories</span>
            </p>
          )}
        </div>
        <DateRangePicker
          date={{
            from: filter.startDate ? new Date(filter.startDate) : null,
            to: filter.endDate ? new Date(filter.endDate) : null,
          }}
          onDateChange={(range) => {
            if (range?.from && range?.to) {
              setFilter({
                startDate: range.from.toISOString(),
                endDate: range.to.toISOString(),
              });
            } else {
              resetToDefault();
            }
          }}
          className="w-full max-w-sm justify-end"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : openPRsData && openPRsData.repositories.length > 0 ? (
        <div className="space-y-6">
          {openPRsData.repositories.map((repo) => (
            <div key={repo._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {repo._id.split('/')[1]}
                  </h3>
                  <span className="px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-full">
                    {repo.totalOpenPRs} open
                  </span>
                </div>
              </div>
              <ul className="divide-y divide-gray-200">
                {repo.prs.map((pr) => {
                  const user = repo.users.find(u => u._id === pr.user);
                  return (
                    <li key={pr.prNumber} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {user && (
                            <img
                              src={user.avatar_url}
                              alt={user.login}
                              className="h-8 w-8 rounded-full"
                            />
                          )}
                          <div>
                            <a
                              href={pr.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                              #{pr.prNumber} {pr.title}
                            </a>
                            <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                              <span>
                                {user ? user.login : 'Unknown'} opened on {format(new Date(pr.created_at), 'MMM d, yyyy')}
                              </span>
                              <span>•</span>
                              <span>
                                {pr.base.ref} ← {pr.head.ref}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No open pull requests found for the selected date range
        </div>
      )}
    </div>
  );
}
