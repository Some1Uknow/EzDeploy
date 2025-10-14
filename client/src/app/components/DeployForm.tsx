"use client";

import { useState } from "react";
import { GitBranch, Github } from "lucide-react";
import { Loader2 } from "lucide-react";
import { CheckCircle } from "lucide-react";
import { XCircle } from "lucide-react";
import { ExternalLink } from "lucide-react";
import { Copy } from "lucide-react";
import { Check } from "lucide-react";
import {
  useGitHubRepositories,
  GitHubRepository,
} from "@/lib/hooks/useGitHubRepositories";
import { signIn } from "@/lib/auth-client";
import { handleApiError } from "@/lib/api";
import { useProjects } from "@/lib/hooks/useProjects";
import RepositorySelector from "./RepositorySelector";
import { useSession } from "@/lib/auth-client";

interface DeployFormProps {
  onDeploymentStart: (deployment: {
    projectSlug: string;
    gitUrl: string;
    url: string;
    userId: string;
  }) => void;
  activeDeployment: string | null;
  onClose?: () => void;
}

interface DeploymentResponse {
  status: string;
  data?: {
    projectSlug: string;
    url: string;
  };
  message?: string;
  error?: string;
}

export default function DeployForm({
  onDeploymentStart,
  activeDeployment,
  onClose,
}: DeployFormProps) {
  const [gitUrl, setGitUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] =
    useState<DeploymentResponse | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [deploymentMode, setDeploymentMode] = useState<"github" | "manual">(
    "github"
  );
  const [selectedRepository, setSelectedRepository] =
    useState<GitHubRepository | null>(null);  const { data: session } = useSession();

  // Use the projects hook for creating projects
  const { createProject } = useProjects({ 
    userId: session?.user?.id, 
    autoFetch: false 
  });
  const {
    repositories,
    loading: reposLoading,
    error: reposError,
    hasGitHubConnection,
    refetch,
  } = useGitHubRepositories();

  const handleConnectGitHub = async () => {
    try {
      await signIn.social({
        provider: "github",
        callbackURL: window.location.href,
      });
    } catch (error) {
      console.error("GitHub sign in error:", error);
    }
  };
  const handleRepositorySelect = (repository: GitHubRepository) => {
    setSelectedRepository(repository);
    setGitUrl(repository.clone_url);
    // Don't auto-set slug - let user decide
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check deployment mode and validate accordingly
    if (deploymentMode === "github" && !selectedRepository) {
      setDeploymentResult({
        status: "error",
        message: "Please select a repository from your GitHub account",
      });
      return;
    }

    if (deploymentMode === "manual" && !gitUrl.trim()) {
      setDeploymentResult({
        status: "error",
        message: "Please enter a Git repository URL",
      });
      return;
    }

    const finalGitUrl =
      deploymentMode === "github"
        ? selectedRepository?.clone_url || ""
        : gitUrl.trim();

    if (!finalGitUrl) return;

    // Validate Git URL for manual mode
    if (deploymentMode === "manual") {
      const gitUrlPattern =
        /^https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/[\w\-\.]+\/[\w\-\.]+\.git?$/i;
      if (!gitUrlPattern.test(finalGitUrl)) {
        setDeploymentResult({
          status: "error",
          message:
            "Please enter a valid Git repository URL (GitHub, GitLab, or Bitbucket)",
        });
        return;
      }
    }

    // Validate slug if provided
    if (slug.trim()) {
      const slugPattern = /^[a-z0-9\-]+$/;
      if (!slugPattern.test(slug.trim())) {
        setDeploymentResult({
          status: "error",
          message:
            "Project slug must contain only lowercase letters, numbers, and hyphens",
        });
        return;
      }
    }
    setIsDeploying(true);
    setDeploymentResult(null);
    setLogs([]);

    try {
      const result = await createProject({
        gitURL: finalGitUrl,
        slug: slug.trim() || undefined,
        userId: session?.user.id,
        name: selectedRepository?.name || slug.trim() || undefined,
      });
      console.log("INPUT", gitUrl, slug, session?.user.id, result);
      // Pass deployment data to parent component
      onDeploymentStart({
        projectSlug: result.projectSlug,
        gitUrl: finalGitUrl,
        userId: session?.user.id || "",
        url: result.url,
      });

      // Close modal immediately
      onClose?.();
    } catch (error) {
      setDeploymentResult({
        status: "error",
        message: handleApiError(error),
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };
  return (
    <div className="space-y-6">
      {/* Public Repository Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Public Repositories Only
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Currently, only public repositories are supported. Private
                repository support is coming soon! Please ensure your repository
                is public before deploying.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Deployment Mode Toggle */}
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => setDeploymentMode("github")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
              deploymentMode === "github"
                ? "bg-white text-black shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Github className="w-4 h-4" />
            GitHub Repositories
          </button>
          <button
            type="button"
            onClick={() => setDeploymentMode("manual")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
              deploymentMode === "manual"
                ? "bg-white text-black shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <GitBranch className="w-4 h-4" />
            Manual Git URL
          </button>
        </div>
        {/* Repository Selection */}
        {deploymentMode === "github" ? (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Select Repository
            </label>
            <RepositorySelector
              repositories={repositories}
              onSelect={handleRepositorySelect}
              loading={reposLoading}
              error={reposError}
              hasGitHubConnection={hasGitHubConnection}
              onConnectGitHub={handleConnectGitHub}
            />
          </div>
        ) : (
          <div>
            <label
              htmlFor="gitUrl"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Git Repository URL
            </label>
            <div className="relative">
              <GitBranch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />{" "}
              <input
                type="url"
                id="gitUrl"
                value={gitUrl}
                onChange={(e) => setGitUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-sm"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Supports GitHub, GitLab, and Bitbucket repositories
            </p>
          </div>
        )}{" "}
        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-gray-900 mb-2"
          >
            Project Name (Optional)
          </label>{" "}
          <input
            type="text"
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-sm"
          />{" "}
          <p className="text-xs text-gray-500 mt-1">
            Auto-generated from repository name if left empty
          </p>
        </div>
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              isDeploying ||
              (deploymentMode === "github"
                ? !selectedRepository
                : !gitUrl.trim())
            }
            className="flex-1 bg-black text-white py-2.5 px-4 rounded-lg font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm"
          >
            {isDeploying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deploying...</span>
              </>
            ) : (
              <span>Deploy</span>
            )}
          </button>
        </div>
      </form>

      {/* Deployment Result */}
      {deploymentResult && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-start gap-3">
            {deploymentResult.status === "queued" ? (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">
                {deploymentResult.status === "queued"
                  ? "Deployment Started"
                  : "Deployment Failed"}
              </h3>
              {deploymentResult.data ? (
                <div className="space-y-3">
                  {" "}
                  <p className="text-sm text-gray-600">
                    Your project is being deployed and will be available at:
                  </p>
                  <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border">
                    <code className="flex-1 text-xs font-mono text-gray-900 truncate">
                      {deploymentResult.data.url}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(deploymentResult.data!.url)
                      }
                      className="p-1.5 hover:bg-gray-200 rounded-md transition-colors duration-200"
                      title="Copy URL"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </button>
                    <a
                      href={deploymentResult.data.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-gray-200 rounded-md transition-colors duration-200"
                      title="Open deployment"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  {deploymentResult.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Build Logs */}
      {logs.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          {" "}
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Deployment Logs
          </h3>
          <div className="bg-gray-900 rounded-lg p-3 max-h-48 overflow-y-auto">
            {logs.map((log, index) => (
              <div
                key={index}
                className="text-green-400 font-mono text-xs mb-1"
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
