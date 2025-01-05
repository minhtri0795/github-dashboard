import { ClosedPRsResponse } from '../types/github';

interface PRListProps {
  title: string;
  data: ClosedPRsResponse;
  description?: string;
}

export function PRList({ title, data, description }: PRListProps) {
  if (!data || !data.repositories) {
    return (
      <div className="bg-card shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-light">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        <p className="mt-4 text-sm text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-card shadow rounded-lg flex flex-col">
      <div className="px-4 py-5 sm:px-6 flex-none">
        <h3 className="text-lg font-medium text-light">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        <p className="mt-1 text-sm text-blue">Total PRs: {data?.totalClosedPRs || 0}</p>
      </div>
      <div className="border-t border-gray-700 flex-1 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue/10 scrollbar-track-transparent hover:scrollbar-thumb-blue/20">
          {data.repositories.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-400">No repositories found</p>
            </div>
          ) : (
            data.repositories.map((repo) => (
              <div key={repo._id} className="border-b border-gray-700 last:border-b-0">
                <div className="px-4 py-4 bg-card border-b border-blue/20 sticky top-0 backdrop-blur-sm">
                  <h4 className="text-md font-semibold text-blue flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{repo._id?.split('/')[1] || 'Unknown Repository'}</span>
                      <div className="px-2 py-1 rounded-full bg-blue/20 text-xs">
                        repository
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-sm">
                      <span className="font-medium text-blue">{repo.mergedPRs || 0}</span>
                      <span className="text-gray-400">merged</span>
                      <span className="text-gray-400">/</span>
                      <span className="font-medium text-blue">{repo.totalClosedPRs || 0}</span>
                      <span className="text-gray-400">total</span>
                    </div>
                  </h4>
                </div>
                <ul className="divide-y divide-gray-700">
                  {!repo.prs || repo.prs.length === 0 ? (
                    <li className="px-4 py-4 sm:px-6">
                      <p className="text-sm text-gray-500">No pull requests found</p>
                    </li>
                  ) : (
                    repo.prs.map((pr) => (
                      <li key={pr.prNumber} className="px-4 py-4 sm:px-6 hover:bg-blue/5 transition-colors group">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex -space-x-1 items-center">
                                {pr.creator && (
                                  <img 
                                    src={pr.creator.avatar_url} 
                                    alt={`${pr.creator.login}'s avatar`}
                                    className="w-6 h-6 rounded-full ring-2 ring-card"
                                  />
                                )}
                                {pr.creator && pr.closer && pr.creator._id !== pr.closer._id && (
                                  <img 
                                    src={pr.closer.avatar_url} 
                                    alt={`${pr.closer.login}'s avatar`}
                                    className="w-6 h-6 rounded-full ring-2 ring-card"
                                  />
                                )}
                              </div>
                              <div className="flex items-center space-x-1 text-sm text-gray-400">
                                <span>{pr.creator?.login || 'Unknown User'}</span>
                                {pr.creator && pr.closer && pr.creator._id !== pr.closer._id && (
                                  <>
                                    <span>→</span>
                                    <span>{pr.closer.login}</span>
                                  </>
                                )}
                              </div>
                              <a
                                href={pr.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-blue hover:text-blue/80 group-hover:text-blue truncate max-w-[300px]"
                              >
                                {pr.title || 'Untitled Pull Request'}
                              </a>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-400">#{pr.prNumber}</span>
                              {pr.creator && pr.closer && pr.creator._id === pr.closer._id && (
                                <span className="text-xs bg-blue/20 text-blue px-2 py-1 rounded-full">
                                  self-merged
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <span>{new Date(pr.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>
                              merged after {Math.round((new Date(pr.closed_at).getTime() - new Date(pr.created_at).getTime()) / (1000 * 60))}min
                            </span>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
