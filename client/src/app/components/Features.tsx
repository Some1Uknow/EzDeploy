import { 
  Zap, 
  Globe, 
  Activity, 
  Shield, 
  GitBranch, 
  Server,
  Database,
  CloudLightning
} from 'lucide-react';
import { TextAnimate } from './ui/text-animate';
import { NumberTicker } from './ui/number-ticker';
import { DotPattern } from './ui/dot-pattern';

export default function Features() {
  const features = [
    {
      icon: Zap,
      title: 'One-Click Deployment',
      description: 'Deploy any web application from a Git repository with a single API call. No complex configurations required.',
    },
    {
      icon: Activity,
      title: 'Real-time Build Logs',
      description: 'Monitor your deployment progress with live WebSocket connections and detailed build information.',
    },
    {
      icon: Globe,
      title: 'Subdomain Routing',
      description: 'Each deployment gets its own subdomain for easy access and testing. Perfect for staging environments.',
    },
    {
      icon: CloudLightning,
      title: 'Auto-Detection',
      description: 'Automatically detects build outputs from dist, build, out, and public directories without configuration.',
    },
    {
      icon: Server,
      title: 'Scalable Architecture',
      description: 'Built on AWS ECS Fargate for automatic scaling. Handle traffic spikes without infrastructure management.',
    },
    {
      icon: Database,
      title: 'S3 Static Hosting',
      description: 'Applications are served from AWS S3 with CloudFront-like proxy for global content distribution.',
    },
    {
      icon: Shield,
      title: 'Secure by Default',
      description: 'Environment variables and credentials are securely managed through AWS ECS task overrides.',
    },
    {
      icon: GitBranch,
      title: 'Git Integration',
      description: 'Direct integration with Git repositories. Support for private repos and branch-specific deployments.',
    },
  ];
  return (
    <section id="features" className="relative py-20 bg-white overflow-hidden">
      {/* Dot Pattern Background */}
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className="absolute inset-0 h-full w-full [mask-image:radial-gradient(800px_circle_at_center,white,transparent)] opacity-40"
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <TextAnimate
            animation="blurInUp"
            by="word"
            className="text-4xl font-bold text-black mb-4"
            as="h2"
          >
            Everything You Need for Modern Deployment
          </TextAnimate>
          <TextAnimate
            animation="fadeIn"
            by="word"
            delay={0.3}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            as="p"
          >
            EzDeploy provides all the essential features for deploying and managing your web applications 
            with enterprise-grade reliability and performance.
          </TextAnimate>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg mb-4 group-hover:bg-black group-hover:text-white transition-all duration-300">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-black mb-2">
              <NumberTicker value={10} />M+
            </div>
            <div className="text-gray-600">Deployments Processed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-black mb-2">
              <NumberTicker value={99.9} decimalPlaces={1} />%
            </div>
            <div className="text-gray-600">Uptime SLA</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-black mb-2">
              <NumberTicker value={30} />s
            </div>
            <div className="text-gray-600">Average Deploy Time</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-black mb-2">
              <NumberTicker value={24} />/<NumberTicker value={7} />
            </div>
            <div className="text-gray-600">Support Available</div>
          </div>
        </div>
      </div>
    </section>
  );
}
