export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/webhooks/github',
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
      USERS: '/users',
      USER_DETAIL: '/users/:githubId'
    }
  }
} as const;

export const getGithubEndpoint = (key: keyof typeof API_CONFIG.ENDPOINTS.GITHUB) => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GITHUB[key]}`;
};
