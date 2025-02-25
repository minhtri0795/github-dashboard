import { useQuery } from "@tanstack/react-query";
import { useFilter } from "../App";
import { githubApi } from "../services/github";
import { DateRangePicker } from "../components/ui/date-range-picker";
import { UserDetail as UserDetailType, PullRequestDetails } from "../types/github";
import { format } from "date-fns";
import { useParams } from "react-router-dom";
import { useMemo } from "react";

interface GroupedPRs {
  [repoFullName: string]: {
    repository: {
      id: number;
      name: string;
      full_name: string;
    };
    pullRequests: (PullRequestDetails & { type: 'open' | 'closed' | 'self-merged' })[];
  };
}

export function UserDetail() {
  const { githubId } = useParams<{ githubId: string }>();
  const { filter, setFilter, resetToDefault } = useFilter();

  // Fetch user data
  const { data: userData, isLoading } = useQuery<UserDetailType>({
    queryKey: ["user-detail", githubId, filter],
    queryFn: () => githubApi.getUserDetail(githubId!, filter),
    enabled: !!githubId
  });

  // Group PRs by repository
  const groupedPRs = useMemo(() => {
    if (!userData) return {};
    
    // Create a Map to deduplicate PRs by PR number
    const prMap = new Map<number, PullRequestDetails & { type: 'open' | 'closed' | 'self-merged' }>();
    
    // Add open PRs
    userData.statistics.details.openPullRequests.forEach(pr => {
      prMap.set(pr.prNumber, { ...pr, type: 'open' });
    });

    // Add closed PRs that aren't self-merged
    userData.statistics.details.closedPullRequests.forEach(pr => {
      if (!prMap.has(pr.prNumber)) {
        prMap.set(pr.prNumber, { ...pr, type: 'closed' });
      }
    });

    // Add self-merged PRs (overriding closed status if exists)
    userData.statistics.details.selfMergedPullRequests.forEach(pr => {
      prMap.set(pr.prNumber, { ...pr, type: 'self-merged' });
    });

    // Group deduplicated PRs by repository
    const grouped: GroupedPRs = {};
    Array.from(prMap.values()).forEach(pr => {
      const repoFullName = pr.repository.full_name;
      if (!grouped[repoFullName]) {
        grouped[repoFullName] = {
          repository: pr.repository,
          pullRequests: []
        };
      }
      grouped[repoFullName].pullRequests.push(pr);
    });

    // Sort PRs within each repository by creation date (newest first)
    Object.values(grouped).forEach(repo => {
      repo.pullRequests.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return grouped;
  }, [userData]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          {userData && (
            <div className="flex items-center space-x-4">
              <img
                src={userData.avatar_url}
                alt={userData.login}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 text-left">{userData.login}</h1>
                <div className="flex space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-500">Open PRs:</span>
                    <span className="text-sm font-medium bg-[#238636] text-white px-2 py-0.5 rounded">
                      {userData.statistics.summary.openPRs}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-500">Closed PRs:</span>
                    <span className="text-sm font-medium bg-[#8957e5] text-white px-2 py-0.5 rounded">
                      {userData.statistics.summary.closedPRs}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-500">Self Merged:</span>
                    <span className="text-sm font-medium bg-amber-500 text-white px-2 py-0.5 rounded">
                      {userData.statistics.summary.selfMergedPRs}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div>
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
            className="max-w-sm justify-end"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Activity Chart */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
            <div className="grid grid-cols-7 gap-2">
              {userData?.statistics.activityByDay.map((day) => (
                <div
                  key={day.date}
                  className="flex flex-col items-center p-2 bg-gray-50 rounded"
                >
                  <span className="text-base text-gray-500">
                    {format(new Date(day.date), "MMM d")}
                  </span>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-xs bg-[#238636] text-white px-1 rounded">
                      {day.created}
                    </span>
                    <span className="text-xs bg-[#8957e5] text-white px-1 rounded">
                      {day.closed}
                    </span>
                    <span className="text-xs bg-amber-500 text-white px-1 rounded">
                      {day.merged}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pull Requests By Repository */}
          <div className="space-y-4">
            {Object.entries(groupedPRs).map(([, { repository, pullRequests }]) => (
              <div key={repository.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">{repository.full_name}</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {pullRequests.map((pr) => (
                    <div key={pr.html_url} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                          <a
                            href={pr.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-left font-medium text-gray-900 hover:text-blue-600"
                          >
                            {pr.title}
                          </a>
                          <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                            <span>#{pr.prNumber}</span>
                            <span>•</span>
                            <span>
                              opened {format(new Date(pr.created_at), "MMM d, yyyy")}
                            </span>
                            {pr.closed_at && (
                              <>
                                <span>•</span>
                                <span>
                                  closed {format(new Date(pr.closed_at), "MMM d, yyyy")}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              pr.type === 'self-merged'
                                ? "bg-amber-500 text-white"
                                : pr.type === 'closed'
                                ? "bg-[#8957e5] text-white"
                                : "bg-[#238636] text-white"
                            }`}
                          >
                            {pr.type === 'self-merged' ? "Self Merged" : pr.type === 'closed' ? "Merged" : "Open"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
