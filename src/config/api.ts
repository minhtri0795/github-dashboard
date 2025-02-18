export const API_CONFIG = {
  BASE_URL: 'https://api.sd-dev.pro/webhooks/github',
  ENDPOINTS: {
    GITHUB: {
      BASE: '',
      ALL_PRS: '/pull-requests',
      STATISTICS: '/statistics',
      REPOSITORY_STATS: '/repository-stats',
      OPEN_PRS: '/open-prs',
      CLOSED_PRS: '/closed-prs',
      COMMITS: '/commits',
      COMMIT_STATISTICS: '/commit-statistics',
      SELF_MERGED_PRS: '/self-merged-prs',
      USERS: '/users'
    }
  }
} as const;

export const getGithubEndpoint = (endpoint: keyof typeof API_CONFIG.ENDPOINTS.GITHUB) => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GITHUB[endpoint]}`;
};
