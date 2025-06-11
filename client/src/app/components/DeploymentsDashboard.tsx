'use client';

import { useState } from 'react';
import { Calendar, Globe, GitBranch, MoreHorizontal, ExternalLink, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface Deployment {
  id: string;
  projectName: string;
  gitUrl: string;
  status: 'success' | 'error' | 'pending' | 'warning';
  deploymentUrl: string;
  createdAt: string;
  duration: string;
}

interface DeploymentsDashboardProps {
  onNewDeployment: () => void;
}

export default function DeploymentsDashboard({ onNewDeployment }: DeploymentsDashboardProps) {
  const [deployments] = useState<Deployment[]>([
    {
      id: '1',
      projectName: 'my-react-app',
      gitUrl: 'https://github.com/user/my-react-app',
      status: 'success',
      deploymentUrl: 'https://my-react-app.ezdeploy.com',
      createdAt: '2025-05-27T10:30:00Z',
      duration: '32s'
    },
    {
      id: '2',
      projectName: 'portfolio-site',
      gitUrl: 'https://github.com/user/portfolio',
      status: 'pending',
      deploymentUrl: 'https://portfolio-site.ezdeploy.com',
      createdAt: '2025-05-27T09:15:00Z',
      duration: '18s'
    },
    {
      id: '3',
      projectName: 'e-commerce-frontend',
      gitUrl: 'https://github.com/user/shop',
      status: 'error',
      deploymentUrl: 'https://e-commerce-frontend.ezdeploy.com',
      createdAt: '2025-05-27T08:45:00Z',
      duration: '45s'
    }
  ]);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const extractRepoName = (gitUrl: string) => {
    const match = gitUrl.match(/\/([^\/]+)(?:\.git)?$/);
    return match ? match[1] : gitUrl;
  };

  if (deployments.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No deployments yet</h3>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          Get started by deploying your first project from a Git repository.
        </p>
        <button 
          onClick={onNewDeployment}
          className="inline-flex items-center px-4 py-2 bg-black text-white font-medium rounded-lg hover:bg-gray-900 transition-colors duration-200"
        >
          Create First Deployment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deployments.map((deployment) => (
        <div 
          key={deployment.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-medium text-gray-900 truncate">
                  {deployment.projectName}
                </h3>
                <StatusBadge 
                  status={deployment.status}
                  text={deployment.status === 'success' ? 'Ready' : deployment.status.charAt(0).toUpperCase() + deployment.status.slice(1)}
                />
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span className="truncate max-w-48">{extractRepoName(deployment.gitUrl)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDate(deployment.createdAt)}</span>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <span>•</span>
                  <span>{deployment.duration}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
              {deployment.status === 'success' && (
                <a
                  href={deployment.deploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
                >
                  <ExternalLink className="w-3 h-3" />
                  Visit
                </a>
              )}
              <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
                