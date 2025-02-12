import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";
import "./App.css";
import { PRList } from "./components/PRList";
import { StatsCard } from "./components/StatsCard";
import { UserStats } from "./components/UserStats";
import { DateRangePicker } from "./components/ui/date-range-picker";
import formatText from "./lib/formatText";
import { githubApi } from "./services/github";
import { DateRange } from "react-day-picker";

// Configure query client with defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchInterval: 2 * 60 * 1000,
      retry: 1,
    },
  },
});

// Helper function to get default date range
const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  return {
    dateRange: {
      from: startDate,
      to: endDate,
    },
    filter: {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    },
  };
};

// Filter context type
type FilterContextType = {
  filter: {
    startDate: string;
    endDate: string;
  };
  setFilter: (filter: { startDate: string; endDate: string }) => void;
  resetToDefault: () => void;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};

function Dashboard() {
  const defaultDates = getDefaultDateRange();
  const [dateRange, setDateRange] = useState<DateRange>(defaultDates.dateRange);
  const [filter, setFilter] = useState(defaultDates.filter);
  const resetToDefault = () => {
    const defaults = getDefaultDateRange();
    setDateRange(defaults.dateRange);
    setFilter(defaults.filter);
  };

  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    if (newRange?.from && newRange?.to) {
      setDateRange(newRange);
      setFilter({
        startDate: newRange.from.toISOString(),
        endDate: newRange.to.toISOString(),
      });
    } else {
      // If the range is cleared, reset to default
      resetToDefault();
    }
  };

  // Fetch PR statistics using the filter from state
  const { data: stats } = useQuery({
    queryKey: ["pr-statistics", filter],
    queryFn: () => githubApi.getPRStatistics(filter),
  });

  // Fetch closed PRs
  const { data: closedPRs } = useQuery({
    queryKey: ["closed-prs", filter],
    queryFn: () => githubApi.getClosedPRs(filter),
  });

  // Fetch repository stats
  const { data: repoStats } = useQuery({
    queryKey: ["repo-stats", filter],
    queryFn: () => githubApi.getRepositoryStats(),
  });

  // Fetch self-merged PRs
  const { data: selfMergedPRs } = useQuery({
    queryKey: ["self-merged-prs", filter],
    queryFn: () => githubApi.getSelfMergedPRs(filter),
  });

  // Fetch users
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => githubApi.getUsers(),
  });

  return (
    <FilterContext.Provider value={{ filter, setFilter, resetToDefault }}>
      <div className="min-h-screen bg-background">
        <header className="">
          <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray">GitHub Dashboard</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex items-center space-x-2 bg-card/50 p-4 rounded-lg shadow-sm">
              <DateRangePicker
                date={dateRange}
                onDateChange={handleDateRangeChange}
                className="w-full max-w-sm"
              />
            </div>
          </div>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Created PRs"
              value={stats?.summary.createdInRange ?? 0}
              description="Last 7 days"
            />
            <StatsCard title="Open PRs" value={stats?.summary.openPRs ?? 0} />

            <StatsCard
              title="Merged PRs"
              value={stats?.summary.mergedInRange ?? 0}
              description="Last 7 days"
            />
            <StatsCard
              title="Self-Merged PRs"
              value={selfMergedPRs?.totalSelfMergedPRs ?? 0}
            />
          </div>

          {/* User Statistics */}
          {users && users.length > 0 && (
            <div className="mb-8">
              <UserStats users={users} />
            </div>
          )}

          {/* PR Lists */}
          <div className="grid grid-cols-1 gap-6">
            {closedPRs && (
              <PRList
                title="Recently Closed Pull Requests"
                data={closedPRs as never}
                description="Pull requests closed in the last 7 days"
              />
            )}
          </div>

          {/* Repository Stats */}
          {repoStats && repoStats.length > 0 && (
            <div className="mt-6">
              <div className="bg-card shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg font-medium text-gray">
                    Repository Statistics
                  </h2>
                  <p className="mt-1 text-sm text-blue">
                    {repoStats.length} active repositories
                  </p>
                </div>
                <div className="border-t border-gray-700">
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {repoStats.map((repo) => (
                      <div
                        key={repo.repository}
                        className="bg-blue/5 border border-blue/10 shadow-lg rounded-lg p-4 hover:bg-blue/10 transition-colors group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-blue font-medium truncate group-hover:text-blue">
                            {formatText(repo._id)}
                          </h3>
                          <div className="px-2 py-1 rounded-full bg-blue/20 text-xs text-blue">
                            repository
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-card rounded-lg p-2 text-center border border-blue/5">
                            <div className="text-gray-400 text-xs mb-1">
                              Total
                            </div>
                            <div className="text-blue font-semibold">
                              {repo.totalPRs}
                            </div>
                          </div>
                          <div className="bg-card rounded-lg p-2 text-center border border-blue/5">
                            <div className="text-gray-400 text-xs mb-1">Open</div>
                            <div className="text-blue font-semibold">
                              {repo.openPRs}
                            </div>
                          </div>
                          <div className="bg-card rounded-lg p-2 text-center border border-blue/5">
                            <div className="text-gray-400 text-xs mb-1">
                              Merged
                            </div>
                            <div className="text-blue font-semibold">
                              {repo.mergedPRs}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 h-2.5 bg-gray-700/50 rounded-full overflow-hidden border border-gray-600">
                          <div
                            className={`h-full transition-all ${
                              (repo.mergedPRs / (repo.totalPRs || 1)) * 100 < 30
                                ? "bg-gradient-to-r from-red-500 to-orange-500"
                                : (repo.mergedPRs / (repo.totalPRs || 1)) * 100 <
                                  70
                                ? "bg-gradient-to-r from-yellow-500 to-green-500"
                                : "bg-gradient-to-r from-green-500 to-emerald-500"
                            }`}
                            style={{
                              width: `${
                                (repo.mergedPRs / (repo.totalPRs || 1)) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <div className="mt-2 flex items-center justify-end space-x-2 text-xs">
                          <div className="flex items-center space-x-1">
                            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" />
                            <span className="text-gray-400">
                              {Math.round(
                                (repo.mergedPRs / (repo.totalPRs || 1)) * 100
                              )}
                              % completion
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </FilterContext.Provider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}

export default App;
