import { useQuery } from "@tanstack/react-query";
import { useFilter } from "../App";
import { githubApi } from "../services/github";
import { DateRangePicker } from "../components/ui/date-range-picker";
import { ClosedPRsResponse } from "../types/github";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export function ClosedPRs() {
  const { filter, setFilter, resetToDefault } = useFilter();
  const [selectedRepo, setSelectedRepo] = useState<string>("all");

  // Fetch closed PRs
  const { data: closedPRsData, isLoading } = useQuery<ClosedPRsResponse>({
    queryKey: ["closed-prs", filter],
    queryFn: () => githubApi.getClosedPRs(filter),
  });

  // Filter repositories based on selection
  const filteredRepositories = useMemo(() => {
    if (!closedPRsData) return [];
    if (selectedRepo === "all") return closedPRsData.repositories;
    return closedPRsData.repositories.filter(repo => repo._id === selectedRepo);
  }, [closedPRsData, selectedRepo]);

  // Calculate total closed PRs for filtered repositories
  const filteredTotalClosedPRs = useMemo(() => {
    return filteredRepositories.reduce((sum, repo) => sum + repo.totalClosedPRs, 0);
  }, [filteredRepositories]);

  // Calculate total merged PRs for filtered repositories
  const filteredTotalMergedPRs = useMemo(() => {
    return filteredRepositories.reduce((sum, repo) => sum + repo.mergedPRs, 0);
  }, [filteredRepositories]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 text-left">Closed Pull Requests</h1>
          {closedPRsData && (
            <p className="text-sm mt-1 flex items-center space-x-2">
              <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-medium">
                {filteredTotalMergedPRs}
              </span>
              <span className="text-gray-500">merged</span>
              <span className="text-gray-300">/</span>
              <span className="bg-gray-50 text-gray-700 bg-zinc-300 px-2 py-0.5 rounded-md font-medium">
                {filteredTotalClosedPRs}
              </span>
              <span className="text-gray-500">closed pull requests across</span>
              <span className="bg-gray-50 text-gray-700 bg-zinc-300 px-2 py-0.5 rounded-md font-medium">
                {filteredRepositories.length}
              </span>
              <span className="text-gray-500">repositories</span>
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Select
            value={selectedRepo}
            onValueChange={setSelectedRepo}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select repository" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Repositories</SelectItem>
              {closedPRsData?.repositories.map((repo) => (
                <SelectItem key={repo._id} value={repo._id}>
                  {repo._id.split('/')[1] || repo._id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Reset Filters
          </button>
        </div>
        
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRepositories.map((repo) => (
            <div key={repo._id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-4 bg-white border-b border-gray-200 sticky top-0 backdrop-blur-sm shadow-sm">
                <h4 className="text-md font-semibold text-gray-900 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{repo._id?.split('/')[1] || 'Unknown Repository'}</span>
                    <div className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                      repository
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-md">
                      <span className="font-medium text-green-700">{repo.mergedPRs}</span>
                      <span className="text-gray-500">merged</span>
                    </div>
                    <span className="text-gray-300">/</span>
                    <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-md">
                      <span className="font-medium text-gray-900">{repo.totalClosedPRs}</span>
                      <span className="text-gray-500">closed</span>
                    </div>
                  </div>
                </h4>
              </div>

              <div className="divide-y divide-gray-200">
                {repo.prs.map((pr) => {
                  return (
                    <div key={pr.prNumber} className="px-4 py-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex -space-x-1 items-center">
                            {pr.creator && (
                              <Link
                                to={`/users/${pr.creator.githubId}`}
                                className="group"
                              >
                                <img
                                  src={pr.creator.avatar_url}
                                  alt={pr.creator.login}
                                  className="w-8 h-8 rounded-full ring-2 ring-transparent group-hover:ring-blue-400 transition-all duration-200"
                                />
                              </Link>
                            )}
                            {pr.creator && pr.closer && pr.creator._id !== pr.closer._id && (
                              <Link
                                to={`/users/${pr.closer.githubId}`}
                                className="group"
                              >
                                <img
                                  src={pr.closer.avatar_url}
                                  alt={pr.closer.login}
                                  className="w-8 h-8 rounded-full ring-2 ring-transparent group-hover:ring-blue-400 transition-all duration-200"
                                />
                              </Link>
                            )}
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <span>{pr.creator?.login || 'Unknown User'}</span>
                            {pr.creator && pr.closer && pr.creator._id !== pr.closer._id && (
                              <>
                                <span>→</span>
                                <span>{pr.closer.login}</span>
                              </>
                            )}
                          </div>
                          <div>
                            <a
                              href={pr.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-gray-900 hover:text-blue-600"
                            >
                              {pr.title}
                            </a>
                            <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                              <span>#{pr.prNumber}</span>
                              <span>•</span>
                              <span>opened {format(new Date(pr.created_at), 'MMM d, yyyy')}</span>
                              <span>•</span>
                              <span>closed {format(new Date(pr.closed_at), 'MMM d, yyyy')}</span>
                              <span>•</span>
                              <span>
                                {Math.round((new Date(pr.closed_at).getTime() - new Date(pr.created_at).getTime()) / (1000 * 60 * 60 * 24))} days duration
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {pr.merged && (
                            <div className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700">
                              merged
                            </div>
                          )}
                          {pr.creator && pr.closer && pr.creator._id === pr.closer._id && (
                            <div className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                              self-merged
                            </div>
                          )}
                          <div className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                            {pr.head.ref}
                          </div>
                          <div className="text-xs px-2 py-1 rounded-full bg-gray-50 text-gray-700">
                            {pr.base.ref}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
