"use client";

import { useState } from "react";
import {
  Search,
  Star,
  GitFork,
  Clock,
  ExternalLink,
  Github,
} from "lucide-react";
import { GitHubRepository } from "@/lib/hooks/useGitHubRepositories";
import Image from "next/image";

// React logo component
const ReactLogo = () => (
  <Image
    src="/React.png"
    alt="React"
    width={16}
    height={16}
    className="w-4 h-4"
  />
);

interface RepositorySelectorProps {
  repositories: GitHubRepository[];
  onSelect: (repository: GitHubRepository) => void;
  loading: boolean;
  error: string | null;
  hasGitHubConnection: boolean;
  onConnectGitHub: () => void;
}

export default function RepositorySelector({
  repositories,
  onSelect,
  loading,
  error,
  hasGitHubConnection,
  onConnectGitHub,
}: RepositorySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(
    null
  );
  const filteredRepositories = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate public and private repositories
  const publicRepos = filteredRepositories.filter((repo) => !repo.private);
  const privateRepos = filteredRepositories.filter((repo) => repo.private);

  const handleRepoSelect = (repo: GitHubRepository) => {
    // Only allow selection of public repositories
    if (repo.private) return;

    setSelectedRepo(repo);
    onSelect(repo);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  // Show GitHub connection prompt if not connected
  if (!hasGitHubConnection && !loading) {
    return (
      <div className="text-center py-8">
        <Github className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Connect Your GitHub Account
        </h3>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          Sign in with GitHub to access and deploy your repositories directly
          from EzDeploy.
        </p>
        <button
          onClick={onConnectGitHub}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
        >
          <Github className="w-4 h-4" />
          Connect GitHub
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your repositories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ExternalLink className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Unable to Load Repositories
        </h3>
        <p className="text-red-600 mb-4 max-w-sm mx-auto text-sm">{error}</p>
        {!hasGitHubConnection && (
          <button
            onClick={onConnectGitHub}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
          >
            <Github className="w-4 h-4" />
            Connect GitHub
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search repositories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-sm"
        />
      </div>
      {/* Repository List */}{" "}
      <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg">
        {filteredRepositories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm
              ? "No repositories match your search."
              : "No repositories found."}
          </div>
        ) : (
          <>
            {/* Public Repositories */}
            {publicRepos.map((repo) => (
              <button
                key={repo.id}
                onClick={() => handleRepoSelect(repo)}
                className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
                  selectedRepo?.id === repo.id
                    ? "bg-blue-50 border-blue-200"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {repo.name}
                      </h3>
                      <span>
                        <ReactLogo />
                      </span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        Public
                      </span>
                      {repo.fork && (
                        <GitFork className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2 overflow-hidden">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {repo.language && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span>{repo.language}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        <span>{repo.stargazers_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(repo.updated_at)}</span>
                      </div>{" "}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      title={`View ${repo.name} on GitHub`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </button>
            ))}
            {/* Private Repositories (Disabled) */}
            {privateRepos.map((repo) => (
              <div
                key={repo.id}
                className="w-full text-left p-4 border-b border-gray-100 opacity-50 cursor-not-allowed bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-700 truncate">
                        {repo.name}
                      </h3>
                      <span className="opacity-50">
                        <ReactLogo />
                      </span>
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                        Private (Soon)
                      </span>
                      {repo.fork && (
                        <GitFork className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2 overflow-hidden">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      {repo.language && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          <span>{repo.language}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        <span>{repo.stargazers_count}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(repo.updated_at)}</span>
                      </div>
                    </div>
                  </div>{" "}
                  <div className="flex items-center gap-2 ml-4">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      title={`View ${repo.name} on GitHub`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}{" "}
          </>
        )}
      </div>
      {selectedRepo && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>{selectedRepo.full_name}</strong> selected for deployment
          </p>
        </div>
      )}
    </div>
  );
}
