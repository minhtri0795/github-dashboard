import { useQuery } from "@tanstack/react-query";
import { useFilter } from "../App";
import { githubApi } from "../services/github";
import { DateRangePicker } from "../components/ui/date-range-picker";
import { OpenPRsResponse } from "../types/github";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from "react";

export function OpenPRs() {
  const { filter, setFilter, resetToDefault } = useFilter();
  const [selectedRepo, setSelectedRepo] = useState<string>("all");

  // Fetch open PRs
  const { data: openPRsData, isLoading } = useQuery<OpenPRsResponse>({
    queryKey: ["open-prs", filter],
    queryFn: () => githubApi.getOpenPRs(filter),
  });

  // Filter repositories based on selection
  const filteredRepositories = useMemo(() => {
    if (!openPRsData) return [];
    if (selectedRepo === "all") return openPRsData.repositories;
    return openPRsData.repositories.filter(repo => repo._id === selectedRepo);
  }, [openPRsData, selectedRepo]);

  // Calculate total open PRs for filtered repositories
  const filteredTotalOpenPRs = useMemo(() => {
    return filteredRepositories.reduce((sum, repo) => sum + repo.totalOpenPRs, 0);
  }, [filteredRepositories]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 text-left">Open Pull Requests</h1>
          {openPRsData && (
            <p className="text-sm mt-1 flex items-center space-x-1">
              <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-medium">
                {filteredTotalOpenPRs}
              </span>
              <span className="text-gray-500">open pull requests across</span>
              <span className="bg-gray-50 text-gray-700 px-2 py-0.5 rounded-md font-medium">
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
              {openPRsData?.repositories.map((repo) => (
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
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
                    <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-md">
                      <span className="font-medium text-green-700">{repo.totalOpenPRs}</span>
                      <span className="text-gray-500">open</span>
                    </div>
                  </div>
                </h4>
              </div>

              <div className="divide-y divide-gray-200">
                {repo.prs.map((pr) => {
                  const user = repo.users.find(u => u._id === pr.user);
                  return (
                    <div key={pr.prNumber} className="px-4 py-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {user && (
                            <img
                              src={user.avatar_url}
                              alt={user.login}
                              className="w-8 h-8 rounded-full"
                            />
                          )}
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
                              {user && (
                                <>
                                  <span>•</span>
                                  <span>by {user.login}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                            {pr.head.ref}
                          </div>
                          <div className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700">
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
