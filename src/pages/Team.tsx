import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { githubApi } from "../services/github";
import { useFilter } from "@/App";
import { DateRangePicker } from "@/components/ui/date-range-picker";

export function Team() {
  const { filter, setFilter, resetToDefault } = useFilter();
  const { data: users, isLoading } = useQuery({
    queryKey: ["users", filter],
    queryFn: () => githubApi.getUsers(filter),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Team Statistics</h1>
      <div className="w-full flex justify-end my-4">
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
        <button
          onClick={resetToDefault}
          className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Reset Filters
        </button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Pull request activity by member
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            users?.map((user) => (
              <div
                key={user._id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <Link
                    to={`/users/${user.githubId}`}
                    className="group flex items-center space-x-3 group p-1 rounded-lg transition-colors duration-200"
                  >
                    <img
                      src={user.avatar_url}
                      alt={user.login}
                      className="w-10 h-10 rounded-full ring-2 ring-transparent group-hover:ring-blue-400 transition-all duration-200"
                    />
                    <span className="group-hover:underline text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                      {user.login}
                    </span>
                  </Link>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-[#238636] text-white px-2 py-1 rounded-full">
                      {user.statistics?.openPRs || 0} open
                    </span>
                    <span className="text-xs bg-[#8957e5] text-white px-2 py-1 rounded-full">
                      {user.statistics?.closedPRs || 0} closed
                    </span>
                    <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">
                      {user.statistics?.selfMergedPRs || 0} self-merged
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {(user.statistics?.openPRs || 0) +
                      (user.statistics?.closedPRs || 0) +
                      (user.statistics?.selfMergedPRs || 0)}{" "}
                    total PRs
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
