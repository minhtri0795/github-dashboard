import axios from 'axios';
import { 
  DateFilterDto, 
  PRStatistics, 
  PullRequest, 
  RepositoryStats, 
  Commit, 
  CommitStatistics, 
  SelfMergedPR, 
  GitHubUserStatistics, 
  OpenPRsResponse, 
  UserDetail,
  GitHubUser,
  CommitsResponse
} from '../types/github';
import { getGithubEndpoint } from '../config/api';

// Create axios instance with common configuration
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.url}:`, {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    console.error(`[API Error] ${error.config?.url}:`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.url}:`, {
      method: config.method,
      params: config.params,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error('[API Request Error]:', error);
    return Promise.reject(error);
  }
);

const getDefaultDateFilter = (): DateFilterDto => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7); // Last 7 days

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

export const githubApi = {
  async getAllPRs(): Promise<PullRequest[]> {
    try {
      const { data } = await api.get(getGithubEndpoint('ALL_PRS'));
      return data;
    } catch (error) {
      console.error('Error fetching all PRs:', error);
      return [];
    }
  },

  async getPRStatistics(filter: DateFilterDto = getDefaultDateFilter()): Promise<PRStatistics> {
    try {
      const { data } = await api.get(getGithubEndpoint('STATISTICS'), { params: filter });
      return data;
    } catch (error) {
      console.error('Error fetching PR statistics:', error);
      throw error;
    }
  },

  async getRepositoryStats(filter: DateFilterDto = getDefaultDateFilter()): Promise<RepositoryStats[]> {
    try {
      const { data } = await api.get(getGithubEndpoint('REPOSITORY_STATS'), { params: filter });
      return data;
    } catch (error) {
      console.error('Error fetching repository stats:', error);
      return [];
    }
  },

  async getOpenPRs(filter: DateFilterDto = getDefaultDateFilter()): Promise<OpenPRsResponse> {
    return api
      .get(getGithubEndpoint('OPEN_PRS'), { params: filter })
      .then((response) => response.data);
  },

  async getClosedPRs(filter: DateFilterDto = getDefaultDateFilter()): Promise<PullRequest[]> {
    try {
      const { data } = await api.get(getGithubEndpoint('CLOSED_PRS'), { params: filter });
      return data;
    } catch (error) {
      console.error('Error fetching closed PRs:', error);
      return [];
    }
  },

  async getSelfMergedPRs(filter: DateFilterDto = getDefaultDateFilter()): Promise<SelfMergedPR> {
    try {
      const { data } = await api.get(getGithubEndpoint('SELF_MERGED_PRS'), { params: filter });
      return data;
    } catch (error) {
      console.error('Error fetching self-merged PRs:', error);
      return {
        totalSelfMergedPRs: 0,
        merged_at: new Date(),
        merged_by: {
          _id: '0',
          githubId: 0,
          login: 'unknown',
          node_id: '',
          avatar_url: '',
          gravatar_id: '',
          url: '',
          html_url: '',
          followers_url: '',
          following_url: '',
          gists_url: '',
          starred_url: '',
          subscriptions_url: '',
          organizations_url: '',
          repos_url: '',
          events_url: '',
          received_events_url: '',
          type: 'User',
          site_admin: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          __v: 0
        }
      };
    }
  },

  async getCommits(filter: DateFilterDto = getDefaultDateFilter()): Promise<Commit[]> {
    try {
      const { data } = await api.get(getGithubEndpoint('COMMITS'), { params: filter });
      return data;
    } catch (error) {
      console.error('Error fetching commits:', error);
      return [];
    }
  },

  async getCommitStatistics(): Promise<CommitStatistics> {
    try {
      const { data } = await api.get(getGithubEndpoint('COMMIT_STATISTICS'));
      return data;
    } catch (error) {
      console.error('Error fetching commit statistics:', error);
      throw error;
    }
  },

  async getUsers(filter: DateFilterDto = getDefaultDateFilter()): Promise<GitHubUserStatistics[]> {
    try {
      const { data } = await api.get(getGithubEndpoint('USERS'), { params: filter });
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  async getUsersAll(): Promise<GitHubUser[]> {
    return api.get(getGithubEndpoint('USERS'));
  },

  async getUserDetail(githubId: string, filter: DateFilterDto = getDefaultDateFilter()): Promise<UserDetail> {
    try {
      console.log('Fetching user detail with params:', { githubId, filter });
      const endpoint = getGithubEndpoint('USER_DETAIL').replace(':githubId', githubId);
      console.log('Calling endpoint:', endpoint);
      const { data } = await api.get(endpoint, { params: filter });
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching user detail:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);
      }
      throw error;
    }
  },
  
  async getCommitsData(filter: DateFilterDto = getDefaultDateFilter()): Promise<CommitsResponse> {
    try {
      const { data } = await api.get(getGithubEndpoint('COMMITS'), { params: filter });
      return data;
    } catch (error) {
      console.error('Error fetching commits data:', error);
      return {
        totalCommits: 0,
        repositories: []
      };
    }
  },
};
