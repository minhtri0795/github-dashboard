export interface DateFilterDto {
  startDate: string;
  endDate: string;
}

export interface GitHubUser {
  _id: string;
  githubId: number;
  login: string;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Repository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
}

export interface PullRequestRef {
  label: string;
  ref: string;
  sha: string;
}

export interface PullRequest {
  prNumber: number;
  title: string;
  html_url: string;
  repository: Repository;
  created_at: string;
  closed_at: string;
  merged: boolean;
  head: PullRequestRef;
  base: PullRequestRef;
  creator: GitHubUser;
  closer: GitHubUser;
}

export interface RepositoryPRs {
  _id: string;
  totalClosedPRs: number;
  mergedPRs: number;
  prs: PullRequest[];
}

export interface ClosedPRsResponse {
  totalClosedPRs: number;
  repositories: RepositoryPRs[];
}

export interface SelfMergedPR {
  merged_at: Date;
  merged_by: GitHubUser;
  totalSelfMergedPRs: number;
}

export interface PRStatistics {
  summary: {
    createdInRange: number;
    openPRs: number;
    closedInRange: number;
    mergedInRange: number;
    dateRange: {
      startDate: Date;
      endDate: Date;
    }
  };
  activity: {
    createdByDay: DailyActivity[];
    closedByDay: DailyActivity[];
    mergedByDay: DailyActivity[];
  }
}

export interface DailyActivity {
  _id: string;
  count: number;
  prs: {
    prNumber: number;
    title: string;
    html_url: string;
    repository: string;
  }[];
}

export interface RepositoryStats {
  repository: string;
  totalPRs: number;
  openPRs: number;
  closedPRs: number;
  mergedPRs: number;
  _id: string;
}

export interface Commit {
  sha: string;
  message: string;
  author: GitHubUser;
  repository: string;
  created_at: Date;
}

export interface CommitStatistics {
  totalCommits: number;
  commitsByAuthor: {
    author: GitHubUser;
    commitCount: number;
  }[];
  commitsByDay: {
    date: string;
    count: number;
  }[];
}

export interface GitHubUserStatistics {
  _id: string;
  githubId: number;
  login: string;
  avatar_url: string;
  statistics: {
    openPRs: number;
    closedPRs: number;
    selfMergedPRs: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface OpenPRsResponse {
  totalOpenPRs: number;
  repositories: Array<{
    _id: string;
    totalOpenPRs: number;
    prs: Array<{
      prNumber: number;
      title: string;
      created_at: string;
      user: string;
      html_url: string;
      head: {
        label: string;
        ref: string;
        sha: string;
      };
      base: {
        label: string;
        ref: string;
        sha: string;
      };
    }>;
    users: GitHubUser[];
  }>;
}
