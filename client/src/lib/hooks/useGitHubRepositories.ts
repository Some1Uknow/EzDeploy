import { useState, useMemo } from 'react';
import { useSession } from '@/lib/auth-client';

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  private: boolean;
  fork: boolean;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface UseGitHubRepositoriesResult {
  repositories: GitHubRepository[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  hasGitHubConnection: boolean;
}

export function useGitHubRepositories(): UseGitHubRepositoriesResult {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGitHubConnection, setHasGitHubConnection] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);
  const { data: session } = useSession();
  const fetchRepositories = async () => {
    if (!session?.user) {
      setError('Not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/github/repositories');
      
      if (!response.ok) {
        if (response.status === 404) {
          setHasGitHubConnection(false);
          setError('GitHub account not connected. Please sign in with GitHub to access your repositories.');
        } else if (response.status === 401) {
          setError('Authentication required');
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to fetch repositories');
        }
        return;
      }

      const data = await response.json();
      const filteredRepos = data.repositories || [];
      setRepositories(filteredRepos);
      setHasGitHubConnection(true);
      
      // If no React repositories found, show a helpful message
      if (filteredRepos.length === 0) {
        setError('No React projects found in your GitHub repositories. Make sure your React projects have a package.json with React dependencies.');
      }
    } catch (err) {
      setError('Network error while fetching repositories');
      console.error('Error fetching repositories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Use useMemo to trigger fetch when session changes or when manually refetched
  useMemo(() => {
    if (session?.user) {
      fetchRepositories();
    }
  }, [session?.user, fetchKey]);

  const refetch = () => {
    setFetchKey(prev => prev + 1);
  };

  return {
    repositories,
    loading,
    error,
    refetch,
    hasGitHubConnection,
  };
}
