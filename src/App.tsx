import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { createContext, useContext, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import { PRList } from "./components/PRList";
import { StatsCard } from "./components/StatsCard";
import { UserStats } from "./components/UserStats";
import { DateRangePicker } from "./components/ui/date-range-picker";
import { githubApi } from "./services/github";
import { DateRange } from "react-day-picker";
import { OpenPRs } from "./pages/OpenPRs";
import { UserDetail } from "./pages/UserDetail";
import { Team } from "./pages/Team";
import { differenceInDays } from "date-fns";
import { validateDateRange, createDateFilter } from "./lib/dateUtils";
import { Turnstile } from '@marsidev/react-turnstile'

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
  const dateRange = {
    from: startDate,
    to: endDate,
  };
  
  return {
    dateRange,
    filter: createDateFilter(dateRange),
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

function Navigation() {
  return (
    <nav className="bg-white shadow-sm container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray"><img src="/logo.png" width={40} height={40}/></h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800 inline-flex items-center px-1 pt-1 border-b-2 text-base font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/open-prs"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800 inline-flex items-center px-1 pt-1 border-b-2 text-base font-medium"
              >
                Open PRs
              </Link>
              <Link
                to="/team"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800 inline-flex items-center px-1 pt-1 border-b-2 text-base font-medium"
              >
                Team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Dashboard() {
  const defaultDates = getDefaultDateRange();
  const [dateRange, setDateRange] = useState<DateRange>(defaultDates.dateRange);
  const [filter, setFilter] = useState(defaultDates.filter);

  const dayCount = useMemo(() => {
    return differenceInDays(new Date(filter.endDate), new Date(filter.startDate));
  }, [filter.startDate, filter.endDate]);

  const resetToDefault = () => {
    const defaults = getDefaultDateRange();
    setDateRange(defaults.dateRange);
    setFilter(defaults.filter);
  };

  const handleDateRangeChange = (newRange: DateRange | undefined) => {
    const validRange = validateDateRange(newRange || dateRange);
    const newFilter = createDateFilter(validRange);
    
    setDateRange(validRange);
    setFilter(newFilter);
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

  // Fetch users stats
  const { data: users } = useQuery({
    queryKey: ["users", filter],
    queryFn: () => githubApi.getUsers(filter),
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
            <div className="mb-6 flex items-center justify-end space-x-2 ">
              <DateRangePicker
                date={dateRange}
                onDateChange={handleDateRangeChange}
                className="w-full max-w-sm justify-end"
              />
            </div>
          </div>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Active PRs"
              value={stats?.summary.createdInRange ?? 0}
              description={dayCount > 1 ? `Last ${dayCount} days` : `Today`}
            />
            <StatsCard
              title="Open PRs"
              value={stats?.summary.openPRs ?? 0}
              description={dayCount > 1 ? `Last ${dayCount} days` : `Today`}
            />
            <StatsCard
              title="Merged PRs"
              value={stats?.summary.mergedInRange ?? 0}
              description={dayCount > 1 ? `Last ${dayCount} days` : `Today`}
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
                description={dayCount > 1 ? `Last ${dayCount} days` : `Today`}
              />
            )}
          </div>

          {/* Repository Stats */}
          {repoStats && repoStats.length > 0 && (
            <div className="mt-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Repository Statistics
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {repoStats.length} active repositories
                  </p>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...repoStats]
                    .sort((a, b) => b.openPRs - a.openPRs)
                    .map((repo) => (
                    <div
                      key={repo.repository}
                      className={`bg-white border shadow-sm rounded-lg p-4 transition-all duration-200 ${
                        repo.openPRs > 0 
                          ? 'border-green-700 shadow-green-700/10' 
                          : 'border-gray-200'
                      } hover:shadow-md`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-medium text-gray-900 truncate max-w-[80%]">
                          {repo._id.split('/')[1]}
                        </h3>
                        <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          repo.openPRs > 5
                            ? 'bg-red-50 text-red-700'
                            : repo.openPRs > 0
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-50 text-gray-500'
                        }`}>
                          {repo.openPRs} open
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <div className="text-xs text-gray-500 mb-1">Total PRs</div>
                          <div className="text-sm font-semibold text-gray-900">{repo.totalPRs}</div>
                        </div>
                        <div className={`rounded-lg p-3 border ${
                          repo.openPRs > 0
                            ? 'bg-green-50/50 border-green-700/10'
                            : 'bg-gray-50 border-gray-100'
                        }`}>
                          <div className={`text-xs mb-1 ${
                            repo.openPRs > 0 ? 'text-green-700/70' : 'text-gray-500'
                          }`}>
                            Open
                          </div>
                          <div className={`text-sm font-semibold ${
                            repo.openPRs > 0 ? 'text-green-700' : 'text-gray-900'
                          }`}>
                            {repo.openPRs}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <div className="text-xs text-gray-500 mb-1">Merged</div>
                          <div className="text-sm font-semibold text-gray-900">{repo.mergedPRs}</div>
                        </div>
                      </div>
                    </div>
                  ))}
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
  const defaultDates = getDefaultDateRange();
  const [filter, setFilter] = useState(defaultDates.filter);

  const resetToDefault = () => {
    const defaults = getDefaultDateRange();
    setFilter(defaults.filter);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <FilterContext.Provider value={{ filter, setFilter, resetToDefault }}>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <Turnstile siteKey='0x4AAAAAABL7MGo5ZGI9pvq0' />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/open-prs" element={<OpenPRs />} />
                <Route path="/team" element={<Team />} />
                <Route path="/users/:githubId" element={<UserDetail />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </FilterContext.Provider>
    </QueryClientProvider>
  );
}
export default App;