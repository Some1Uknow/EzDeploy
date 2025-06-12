'use client';

import { useState, useEffect } from 'react';
import { GitBranch, Github } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { CheckCircle } from 'lucide-react';
import { XCircle } from 'lucide-react';
import { ExternalLink } from 'lucide-react';
import { Copy } from 'lucide-react';
import { Check } from 'lucide-react';
import { useGitHubRepositories, GitHubRepository } from '@/lib/hooks/useGitHubRepositories';
import { signIn, useSession } from '@/lib/auth-client';
import RepositorySelector from './RepositorySelector';

interface DeployFormProps {
  onDeploymentStart: (projectId: string) => void;
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
}

export default function DeployForm({ onDeploymentStart, activeDeployment, onClose }: DeployFormProps) {
  const [gitUrl, setGitUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResponse | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [deploymentMode, setDeploymentMode] = useState<'github' | 'manual'>('github');
  const [selectedRepository, setSelectedRepository] = useState<GitHubRepository | null>(null);
  
  const { data: session } = useSession();
  const { repositories, loading: reposLoading, error: reposError, hasGitHubConnection, refetch } = useGitHubRepositories();

  const validateGitUrl = (url: string) => {
    const gitUrlPattern = /^https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/[\w\-\.]+\/[\w\-\.]+\.git?$/i;
    return gitUrlPattern.test(url);
  };
  const validateSlug = (slug: string) => {
    const slugPattern = /^[a-z0-9\-]+$/;
    return slug === '' || slugPattern.test(slug);
  };

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
    setSlug(repository.name.toLowerCase().replace(/[^a-z0-9\-]/g, '-'));
  };  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check deployment mode and validate accordingly
    if (deploymentMode === 'github' && !selectedRepository) {
      setDeploymentResult({
        status: 'error',
        message: 'Please select a repository from your GitHub account',
      });
      return;
    }
    
    if (deploymentMode === 'manual' && !gitUrl.trim()) {
      setDeploymentResult({
        status: 'error',
        message: 'Please enter a Git repository URL',
      });
      return;
    }

    const finalGitUrl = deploymentMode === 'github' 
      ? selectedRepository?.clone_url || ''
      : gitUrl.trim();

    if (!finalGitUrl) return;

    // Validate Git URL for manual mode
    if (deploymentMode === 'manual') {
      const gitUrlPattern = /^https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/[\w\-\.]+\/[\w\-\.]+\.git?$/i;
      if (!gitUrlPattern.test(finalGitUrl)) {
        setDeploymentResult({
          status: 'error',
          message: 'Please enter a valid Git repository URL (GitHub, GitLab, or Bitbucket)',
        });
        return;
      }
    }

    // Validate slug if provided
    if (slug.trim()) {
      const slugPattern = /^[a-z0-9\-]+$/;
      if (!slugPattern.test(slug.trim())) {
        setDeploymentResult({
          status: 'error',
          message: 'Project slug must contain only lowercase letters, numbers, and hyphens',
        });
        return;
      }
    }

    setIsDeploying(true);
    setDeploymentResult(null);
    setLogs([]);

    try {
      const response = await fetch('http://localhost:9000/project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gitURL: finalGitUrl,
          slug: slug.trim() || undefined,
        }),
      });

      const data = await response.json();
      setDeploymentResult(data);

      if (data.status === 'queued' && data.data?.projectSlug) {
        onDeploymentStart(data.data.projectSlug);
        simulateLogs();
      }
    } catch (error) {
      setDeploymentResult({
        status: 'error',
        message: 'Failed to connect to deployment service',
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const simulateLogs = () => {
    const logMessages = [
      'Initializing deployment...',
      'Cloning repository...',
      'Installing dependencies...',
      'Running build process...',
      'Uploading to S3...',
      'Deployment completed successfully!',
    ];

    logMessages.forEach((message, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
      }, (index + 1) * 1000);
    });
  };
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };
  const handleSuccess = () => {
    // Reset form after successful deployment
    setTimeout(() => {
      setGitUrl('');
      setSlug('');
      setSelectedRepository(null);
      setDeploymentResult(null);
      setLogs([]);
      onClose?.();
    }, 3000);
  };

  useEffect(() => {
    if (deploymentResult?.status === 'queued') {
      handleSuccess();
    }
  }, [deploymentResult?.status]);
  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Deployment Mode Toggle */}
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => setDeploymentMode('github')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
              deploymentMode === 'github'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Github className="w-4 h-4" />
            GitHub Repositories
          </button>
          <button
            type="button"
            onClick={() => setDeploymentMode('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
              deploymentMode === 'manual'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            Manual Git URL
          </button>
        </div>

        {/* Repository Selection */}
        {deploymentMode === 'github' ? (
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
            <label htmlFor="gitUrl" className="block text-sm font-medium text-gray-900 mb-2">
              Git Repository URL
            </label>
            <div className="relative">
              <GitBranch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                id="gitUrl"
                value={gitUrl}
                onChange={(e) => setGitUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-sm"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Supports GitHub, GitLab, and Bitbucket repositories
            </p>
          </div>
        )}

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-900 mb-2">
            Project Name (Optional)
          </label>
          <input
            type="text"
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="my-awesome-project"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to auto-generate from repository name
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
            disabled={isDeploying || (deploymentMode === 'github' ? !selectedRepository : !gitUrl.trim())}
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
            {deploymentResult.status === 'queued' ? (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">
                {deploymentResult.status === 'queued' ? 'Deployment Started' : 'Deployment Failed'}
              </h3>
              {deploymentResult.data ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Your project is being deployed. You can access it at:
                  </p>
                  <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg border">
                    <code className="flex-1 text-xs font-mono text-gray-900 truncate">
                      {deploymentResult.data.url}
                    </code>
                    <button
                      onClick={() => copyToClipboard(deploymentResult.data!.url)}
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
                <p className="text-sm text-gray-600">{deploymentResult.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Build Logs */}
      {logs.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Build Logs
          </h3>
          <div className="bg-gray-900 rounded-lg p-3 max-h-48 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-green-400 font-mono text-xs mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
