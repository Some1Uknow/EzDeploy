'use client';

import { useState } from 'react';
import { Calendar, Globe, GitBranch, MoreHorizontal, ExternalLink } from 'lucide-react';
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

export default function DeploymentsDashboard() {
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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-black mb-4">
            Recent Deployments
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Monitor and manage all your deployments from a single dashboard. 
            Track build status, access logs, and manage your deployed applications.
          </p>
        </div>

        {/* Dashboard Controls */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-black">Deployment History</h3>
              <p className="text-gray-600 text-sm">Showing {deployments.length} recent deployments</p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors duration-200">
                Filter
              </button>
              <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors duration-200">
                New Deployment
              </button>
            </div>
          </div>
        </div>

        {/* Deployments List */}
        <div className="space-y-4">
          {deployments.map((deployment) => (
            <div 
              key={deployment.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <h4 className="text-lg font-semibold text-black">
                      {deployment.projectName}
                    </h4>
                    <StatusBadge 
                      status={deployment.status}
                      text={deployment.status.charAt(0).toUpperCase() + deployment.status.slice(1)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <GitBranch className="w-4 h-4 mr-2" />
                      <span className="truncate">{deployment.gitUrl}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{formatDate(deployment.createdAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      <span>Duration: {deployment.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <a
                    href={deployment.deploymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    title="Open deployment"
                  >
                    <ExternalLink className="w-5 h-5 text-gray-500" />
                  </a>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                    <MoreHorizontal className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (if no deployments) */}
        {deployments.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">No deployments yet</h3>
            <p className="text-gray-600 mb-6">
              Deploy your first project to see it appear here.
            </p>
            <button className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-900 transition-colors duration-200">
              Create First Deployment
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
