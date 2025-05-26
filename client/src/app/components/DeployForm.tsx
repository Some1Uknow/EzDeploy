'use client';

import { useState, useEffect } from 'react';
import { GitBranch } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { CheckCircle } from 'lucide-react';
import { XCircle } from 'lucide-react';
import { ExternalLink } from 'lucide-react';
import { Copy } from 'lucide-react';
import { Check } from 'lucide-react';

interface DeployFormProps {
  onDeploymentStart: (projectId: string) => void;
  activeDeployment: string | null;
}

interface DeploymentResponse {
  status: string;
  data?: {
    projectSlug: string;
    url: string;
  };
  message?: string;
}

export default function DeployForm({ onDeploymentStart, activeDeployment }: DeployFormProps) {
  const [gitUrl, setGitUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResponse | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validateGitUrl = (url: string) => {
    const gitUrlPattern = /^https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/[\w\-\.]+\/[\w\-\.]+\.git?$/i;
    return gitUrlPattern.test(url);
  };

  const validateSlug = (slug: string) => {
    const slugPattern = /^[a-z0-9\-]+$/;
    return slug === '' || slugPattern.test(slug);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gitUrl.trim()) return;

    // Validate Git URL
    const gitUrlPattern = /^https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/[\w\-\.]+\/[\w\-\.]+\.git?$/i;
    if (!gitUrlPattern.test(gitUrl.trim())) {
      setDeploymentResult({
        status: 'error',
        message: 'Please enter a valid Git repository URL (GitHub, GitLab, or Bitbucket)',
      });
      return;
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
          gitURL: gitUrl.trim(),
          slug: slug.trim() || undefined,
        }),
      });

      const data = await response.json();
      setDeploymentResult(data);

      if (data.status === 'queued' && data.data?.projectSlug) {
        onDeploymentStart(data.data.projectSlug);
        // Here you would normally connect to WebSocket for real-time logs
        // For demo purposes, we'll simulate logs
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

  return (
    <section id="deploy" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-black mb-4">Deploy Your Project</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Paste your Git repository URL and deploy your web application in seconds.
            We support React, Vue, Angular, Next.js, and more.
          </p>
        </div>

        {/* Deployment Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="gitUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Git Repository URL *
              </label>
              <div className="relative">
                <GitBranch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  id="gitUrl"
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  placeholder="https://github.com/username/repository.git"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                Project Slug (Optional)
              </label>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-awesome-project"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to auto-generate from repository name
              </p>
            </div>

            <button
              type="submit"
              disabled={isDeploying || !gitUrl.trim()}
              className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Deploying...</span>
                </>
              ) : (
                <span>Deploy Project</span>
              )}
            </button>
          </form>
        </div>

        {/* Deployment Result */}
        {deploymentResult && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex items-start space-x-4">
              {deploymentResult.status === 'queued' ? (
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-black mb-2">
                  {deploymentResult.status === 'queued' ? 'Deployment Queued' : 'Deployment Failed'}
                </h3>
                {deploymentResult.data ? (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Your project is being deployed. You can access it at:
                    </p>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <code className="flex-1 text-sm font-mono text-black">
                        {deploymentResult.data.url}
                      </code>                      <button
                        onClick={() => copyToClipboard(deploymentResult.data!.url)}
                        className="p-2 hover:bg-gray-200 rounded-md transition-colors duration-200"
                        title="Copy URL to clipboard"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      <a
                        href={deploymentResult.data.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-200 rounded-md transition-colors duration-200"
                        title="Open deployment in new tab"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-500" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">{deploymentResult.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Build Logs */}
        {logs.length > 0 && (
          <div className="bg-black rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Build Logs
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-green-400 font-mono text-sm mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
