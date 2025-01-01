export interface DateFilterDto {
  startDate?: string;
  endDate?: string;
}

export interface GitHubUser {
  login: string;
  githubId: number;
}

export interface PullRequest {
  prNumber: number;
  title: string;
  html_url: string;
  repository: string;
  created_at: Date;
  state?: string;
  user: GitHubUser;
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
