import { Link } from "react-router-dom";
import { GitHubUserStatistics } from "../types/github";

interface UserStatsProps {
  users: GitHubUserStatistics[];
}

export function UserStats({ users }: UserStatsProps) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">
          Team Statistics
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Pull request activity by member
        </p>
      </div>
      <div>
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li
              key={user._id}
              className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={user.avatar_url}
                  alt={`${user.login}'s avatar`}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <Link to={`/users/${user.githubId}`} className="text-sm hover:underline font-medium text-gray-900 truncate">
                    {user.login}
                  </Link>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        user.statistics.openPRs > 0 ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span>{user.statistics.openPRs} open</span>
                    </div>
                    <span>•</span>
                    <span>{user.statistics.closedPRs} closed</span>
                    <span>•</span>
                    <div className={`flex items-center space-x-1 ${
                      user.statistics.selfMergedPRs > 0 
                        ? 'text-amber-600 font-medium' 
                        : ''
                    }`}>
                      {user.statistics.selfMergedPRs > 0 && (
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                      )}
                      <span>{user.statistics.selfMergedPRs} self-merged</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-end">
                    <span className="text-base font-semibold text-gray-900">
                      {user.statistics.closedPRs + user.statistics.openPRs}
                    </span>
                    <span className="text-xs text-gray-500">total PRs</span>
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
