import { Server, Database, Globe, ArrowRight, Code, Cloud } from 'lucide-react';
import { TextAnimate } from './ui/text-animate';
import { NumberTicker } from './ui/number-ticker';
import { GridPattern } from './ui/grid-pattern';
import { Ripple } from './ui/ripple';

export default function Architecture() {
  const services = [
    {
      name: 'API Server',
      description: 'Express.js REST API that handles deployment requests and manages the build pipeline.',
      features: [
        'WebSocket server for real-time logs',
        'AWS ECS task orchestration',
        'Redis pub/sub integration',
        'Environment validation'
      ],
      icon: Server,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      name: 'Build Server',
      description: 'Containerized build environment that clones, builds, and uploads projects.',
      features: [
        'Docker-based Node.js 20 environment',
        'Automatic build detection',
        'S3 upload with MIME types',
        'Real-time log publishing'
      ],
      icon: Code,
      color: 'bg-green-50 text-green-600',
    },
    {
      name: 'S3 Reverse Proxy',
      description: 'Lightweight proxy server that routes subdomain requests to S3 objects.',
      features: [
        'Subdomain-based routing',
        'Static file serving from S3',
        'Automatic index.html resolution',
        'Express.js with proxy middleware'
      ],
      icon: Globe,
      color: 'bg-purple-50 text-purple-600',
    },
  ];
  return (
    <section id="architecture" className="relative py-20 bg-gray-50 overflow-hidden">
      {/* Grid Pattern Background */}
      <GridPattern
        width={50}
        height={50}
        x={-1}
        y={-1}
        strokeDasharray="4 2"
        className="absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30 [mask-image:radial-gradient(700px_circle_at_center,white,transparent)]"
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <TextAnimate
            animation="blurInUp"
            by="word"
            className="text-4xl font-bold text-black mb-4"
            as="h2"
          >
            Microservices Architecture
          </TextAnimate>
          <TextAnimate
            animation="fadeIn"
            by="word"
            delay={0.3}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            as="p"
          >
            EzDeploy is built with a modern microservices architecture that ensures scalability, 
            reliability, and maintainability across all deployment workflows.
          </TextAnimate>
        </div>        {/* Architecture Diagram */}
        <div className="mb-16">
          <div className="relative bg-white rounded-2xl border border-gray-200 p-8 overflow-hidden">
            {/* Ripple effect for the center diagram */}
            <Ripple 
              mainCircleSize={150}
              mainCircleOpacity={0.1}
              numCircles={6}
              className="absolute inset-0"
            />
            <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {services.map((service, index) => (
                <div key={index} className="relative">
                  <div className="bg-gray-50 rounded-xl p-6 h-full">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${service.color}`}>
                      <service.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-black mb-3">
                      {service.name}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      {service.description}
                    </p>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Arrow connector for desktop */}
                  {index < services.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Infrastructure Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-50 text-orange-600 rounded-lg mr-4">
                <Cloud className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-black">AWS Infrastructure</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium text-black">ECS Fargate</div>
                  <div className="text-gray-600 text-sm">Serverless container orchestration for build tasks</div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium text-black">S3 + CloudFront</div>
                  <div className="text-gray-600 text-sm">Global content delivery and static hosting</div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium text-black">VPC Security</div>
                  <div className="text-gray-600 text-sm">Private subnets with security groups</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-50 text-red-600 rounded-lg mr-4">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-black">Data & Communication</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium text-black">Redis Pub/Sub</div>
                  <div className="text-gray-600 text-sm">Real-time log streaming and communication</div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium text-black">WebSocket API</div>
                  <div className="text-gray-600 text-sm">Live build progress and deployment status</div>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                <div>
                  <div className="font-medium text-black">RESTful APIs</div>
                  <div className="text-gray-600 text-sm">Clean, well-documented deployment endpoints</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deployment Flow */}
        <div className="mt-16 bg-white rounded-2xl border border-gray-200 p-8">
          <h3 className="text-2xl font-bold text-black mb-8 text-center">Deployment Flow</h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[
              'API Request',
              'Task Creation',
              'Git Clone',
              'Build Process',
              'S3 Upload',
              'Live Deployment'
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">
                    {index + 1}
                  </div>
                  <div className="text-sm font-medium text-black">{step}</div>
                </div>
                {index < 5 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
