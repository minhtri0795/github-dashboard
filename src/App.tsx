import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { StatsCard } from './components/StatsCard'
import { PRList } from './components/PRList'
import { githubApi } from './services/github'
import { useMemo } from 'react'
import './App.css'

// Configure query client with defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
      retry: 1, // Only retry failed requests once
    },
  },
})

function Dashboard() {
  // Memoize the date filter to prevent unnecessary re-renders
  const filter = useMemo(() => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)
    return {
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString()
    }
  }, []) // Empty deps array since we want this to be stable

  // Fetch PR statistics
  const { data: stats } = useQuery({
    queryKey: ['pr-statistics', filter],
    queryFn: () => githubApi.getPRStatistics(filter)
  })

  // Fetch open PRs
  const { data: openPRs } = useQuery({
    queryKey: ['open-prs', filter],
    queryFn: () => githubApi.getOpenPRs(filter)
  })

  // Fetch closed PRs
  const { data: closedPRs } = useQuery({
    queryKey: ['closed-prs', filter],
    queryFn: () => githubApi.getClosedPRs(filter)
  })

  // Fetch repository stats
  const { data: repoStats } = useQuery({
    queryKey: ['repository-stats'],
    queryFn: () => githubApi.getRepositoryStats()
  })

  // Fetch self-merged PRs
  const { data: selfMergedPRs } = useQuery({
    queryKey: ['self-merged-prs', filter],
    queryFn: () => githubApi.getSelfMergedPRs(filter)
  })
  console.log('selfMergedPRs', selfMergedPRs)
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">GitHub Dashboard</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Created PRs" 
            value={stats?.summary.createdInRange ?? 0}
            description="Last 7 days"
          />
          <StatsCard 
            title="Open PRs" 
            value={stats?.summary.openPRs ?? 0}
          />
          
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

        {/* PR Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PRList 
            title="Open Pull Requests" 
            prs={openPRs ?? []}
          />
          <PRList 
            title="Recently Closed Pull Requests" 
            prs={closedPRs ?? []}
          />
        </div>

        {/* Repository Stats */}
        {repoStats && repoStats.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Repository Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {repoStats.map((repo) => (
                <div key={repo.repository} className="bg-white shadow rounded-lg p-4">
                  <h3 className="font-medium">{repo.repository}</h3>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>Total PRs: {repo.totalPRs}</div>
                    <div>Open PRs: {repo.openPRs}</div>
                    <div>Closed PRs: {repo.closedPRs}</div>
                    <div>Merged PRs: {repo.mergedPRs}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  )
}

export default App
