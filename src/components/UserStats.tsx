import { GitHubUserStatistics } from "../types/github";

interface UserStatsProps {
  users: GitHubUserStatistics[];
}

export function UserStats({ users }: UserStatsProps) {
  return (
    <div className="bg-card shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6">
        <h2 className="text-xl text-light font-semibold mb-4">
          Team Statistics
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Pull request activity by member
        </p>
      </div>
      <div className="border-t border-gray-700">
        <ul className="divide-y divide-gray-700">
          {users.map((user) => (
            <li
              key={user._id}
              className="px-4 py-4 sm:px-6 hover:bg-blue/5 transition-colors group"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={user.avatar_url}
                  alt={`${user.login}'s avatar`}
                  className="w-10 h-10 rounded-full ring-2 ring-card"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue group-hover:text-blue truncate">
                    {user.login}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>{user.statistics.openPRs} open</span>
                    <span>•</span>
                    <span>{user.statistics.closedPRs} closed</span>
                    <span>•</span>
                    <span>{user.statistics.selfMergedPRs} self-merged</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-end">
                    <span className="text-base font-semibold text-blue">
                      {user.statistics.closedPRs + user.statistics.openPRs}
                    </span>
                    <span className="text-xs text-gray-400">total PRs</span>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-gray-700/50 border border-gray-600 p-[2px]">
                    <div className={`h-full w-full rounded-full flex items-center justify-center ${
                      (user.statistics.closedPRs / (user.statistics.closedPRs + user.statistics.openPRs)) * 100 < 30
                        ? 'bg-gradient-to-r from-red-500 to-orange-500'
                        : (user.statistics.closedPRs / (user.statistics.closedPRs + user.statistics.openPRs)) * 100 < 70
                        ? 'bg-gradient-to-r from-yellow-500 to-green-500'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}>
                      <span className="text-sm font-medium text-white">
                        {Math.round(
                          (user.statistics.closedPRs /
                            (user.statistics.closedPRs +
                              user.statistics.openPRs)) *
                            100
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
