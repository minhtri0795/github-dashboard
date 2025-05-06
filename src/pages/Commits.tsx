import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { githubApi } from "../services/github";
import { useFilter } from "../App";
import { DateRangePicker } from "../components/ui/date-range-picker";
import { RepositoryCommits } from "../types/github";
import { differenceInDays } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export function Commits() {
  const { filter, setFilter, resetToDefault } = useFilter();
  const [selectedRepository, setSelectedRepository] = useState<string | "all">(
    "all"
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["commits", filter],
    queryFn: () => githubApi.getCommitsData(filter),
  });

  const dayCount = useMemo(() => {
    return differenceInDays(
      new Date(filter.endDate),
      new Date(filter.startDate)
    );
  }, [filter.startDate, filter.endDate]);

  const filteredRepositories = useMemo(() => {
    if (!data) return [];

    if (selectedRepository === "all") {
      return data.repositories;
    }

    return data.repositories.filter((repo) => repo._id === selectedRepository);
  }, [data, selectedRepository]);

  const totalCommits = useMemo(() => {
    if (!filteredRepositories) return 0;
    return filteredRepositories.reduce(
      (sum, repo) => sum + repo.totalCommits,
      0
    );
  }, [filteredRepositories]);

  const totalAdditions = useMemo(() => {
    if (!filteredRepositories) return 0;
    return filteredRepositories.reduce(
      (sum, repo) => sum + repo.totalAdditions,
      0
    );
  }, [filteredRepositories]);

  const totalDeletions = useMemo(() => {
    if (!filteredRepositories) return 0;
    return filteredRepositories.reduce(
      (sum, repo) => sum + repo.totalDeletions,
      0
    );
  }, [filteredRepositories]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mt-4">
        <h3 className="text-lg font-medium">Error loading commits data</h3>
        <p className="mt-2 text-sm">
          Please try again later or contact support if the issue persists.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
          GitHub Commits
        </h1>

        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <div className="w-full md:w-auto">
           
            <Select value={selectedRepository} onValueChange={setSelectedRepository}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select repository" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Repositories</SelectItem>
                {data?.repositories.map((repo) => (
                  <SelectItem key={repo._id} value={repo._id}>
                    {repo._id.split("/")[1] || repo._id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-auto">
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

          <button
            onClick={resetToDefault}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Commit Statistics
          </h3>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-green-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-green-800 truncate">
                  Total Commits
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-green-900">
                  {totalCommits}
                </dd>
                <dd className="mt-1 text-sm text-green-700">
                  Over {dayCount} days
                </dd>
              </div>
            </div>
            <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-blue-800 truncate">
                  Additions
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-blue-900">
                  {totalAdditions}
                </dd>
              </div>
            </div>
            <div className="bg-red-50 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-red-800 truncate">
                  Deletions
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-red-900">
                  {totalDeletions}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {filteredRepositories.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">
            No commit data available for the selected filters.
          </p>
        </div>
      ) : (
        filteredRepositories.map((repo: RepositoryCommits) => (
          <div
            key={repo._id}
            className="bg-white shadow rounded-lg mb-6 overflow-hidden"
          >
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {repo._id.split("/")[1] || repo._id}
                </h3>
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {repo.totalCommits} commits
                </span>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {repo.commits.map((commit) => (
                    <li key={commit.sha} className="py-5">
                      <div className="flex items-start">
                        {repo.authors.find(
                          (author) => author._id === commit.author
                        ) && (
                          <div className="flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={
                                repo.authors.find(
                                  (author) => author._id === commit.author
                                )?.avatar_url
                              }
                              alt=""
                            />
                          </div>
                        )}
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {repo.authors.find(
                                (author) => author._id === commit.author
                              )?.login || "Unknown"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(commit.created_at).toLocaleDateString()}{" "}
                              {new Date(commit.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="mt-2 text-sm text-gray-700">
                            <p>{commit.message}</p>
                          </div>
                          <div className="mt-2 flex items-center space-x-4">
                            <a
                              href={commit.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-green-600 hover:text-green-800"
                            >
                              View on GitHub
                            </a>
                            <span className="text-sm text-gray-500">
                              Branch:{" "}
                              <span className="font-medium">
                                {commit.branch}
                              </span>
                            </span>
                            <span className="text-sm text-gray-500">
                              SHA:{" "}
                              <span className="font-mono text-xs">
                                {commit.sha.substring(0, 7)}
                              </span>
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-green-600">
                                +{commit.stats.additions}
                              </span>
                              <span className="text-sm text-red-600">
                                -{commit.stats.deletions}
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
          </div>
        ))
      )}
    </div>
  );
}
