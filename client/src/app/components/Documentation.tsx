import { BookOpen, Code, Terminal, Settings, ExternalLink } from "lucide-react";
import { TextAnimate } from './ui/text-animate';
import { ShimmerButton } from './ui/shimmer-button';
import { AnimatedGradientText } from './ui/animated-gradient-text';
import { GridPattern } from './ui/grid-pattern';

export default function Documentation() {
  const docs = [
    {
      title: "Quick Start Guide",
      description: "Get up and running with EzDeploy in under 5 minutes.",
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600",
      sections: [
        "Environment Setup",
        "First Deployment",
        "Monitoring Builds",
        "Custom Domains",
      ],
    },
    {
      title: "API Reference",
      description: "Complete documentation for all EzDeploy REST endpoints.",
      icon: Code,
      color: "bg-green-50 text-green-600",
      sections: [
        "Authentication",
        "Deployment API",
        "Status Endpoints",
        "WebSocket Events",
      ],
    },
    {
      title: "CLI Tools",
      description: "Command-line tools for advanced deployment workflows.",
      icon: Terminal,
      color: "bg-purple-50 text-purple-600",
      sections: [
        "Installation",
        "Configuration",
        "Batch Deployments",
        "Automation Scripts",
      ],
    },
    {
      title: "Configuration",
      description: "Advanced configuration options and environment setup.",
      icon: Settings,
      color: "bg-orange-50 text-orange-600",
      sections: [
        "Environment Variables",
        "AWS Setup",
        "Custom Build Scripts",
        "Security Settings",
      ],
    },
  ];

  const codeExample = `// Deploy a project using the API
const response = await fetch('http://localhost:9000/project', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    gitURL: 'https://github.com/username/repo.git',
    slug: 'my-project'
  })
});

const data = await response.json();
console.log('Deployment URL:', data.data.url);`;
  return (
    <>
      <section id="docs" className="relative py-20 bg-white overflow-hidden">
        {/* Grid Pattern Background */}
        <GridPattern
          width={40}
          height={40}
          x={-1}
          y={-1}
          className="absolute inset-0 h-full w-full fill-gray-400/20 stroke-gray-400/20 [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <TextAnimate
              animation="blurInUp"
              by="word"
              className="text-4xl font-bold text-black mb-4"
              as="h2"
            >
              Documentation & Guides
            </TextAnimate>
            <TextAnimate
              animation="fadeIn"
              by="word"
              delay={0.3}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              as="p"
            >
              Everything you need to get started with EzDeploy, from basic
              deployments to advanced configuration and automation.
            </TextAnimate>
          </div>

          {/* Documentation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {docs.map((doc, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl border border-gray-100 p-8 hover:border-gray-200 hover:shadow-sm transition-all duration-300 group"
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-lg ${doc.color} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <doc.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-black mb-2 group-hover:text-gray-900">
                      {doc.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{doc.description}</p>
                    <ul className="space-y-2">
                      {doc.sections.map((section, sectionIndex) => (
                        <li
                          key={sectionIndex}
                          className="flex items-center text-sm text-gray-500"
                        >
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3" />
                          {section}
                        </li>
                      ))}
                    </ul>            <div className="mt-6">
              <ShimmerButton
                className="inline-flex items-center text-white font-medium"
                shimmerColor="#ffffff"
                background="rgba(0, 0, 0, 1)"
                borderRadius="8px"
              >
                Read Documentation
                <ExternalLink className="w-4 h-4 ml-2" />
              </ShimmerButton>
            </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Code Example */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-black mb-2">
                Quick Start Example
              </h3>
              <p className="text-gray-600">
                Deploy your first project with a simple API call.
              </p>
            </div>

            <div className="bg-black rounded-xl p-6 overflow-x-auto">
              <pre className="text-green-400 font-mono text-sm leading-relaxed">
                <code>{codeExample}</code>
              </pre>
            </div>            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <ShimmerButton
                className="inline-flex items-center justify-center px-6 py-3 font-medium rounded-lg"
                shimmerColor="#ffffff"
                background="rgba(0, 0, 0, 1)"
                borderRadius="8px"
              >
                <BookOpen className="w-5 h-5 mr-2 text-white" />
                <span className="text-white">View Full Documentation</span>
              </ShimmerButton>
              <button className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 hover:text-black transition-colors duration-200">
                <Code className="w-5 h-5 mr-2" />
                API Reference
              </button>
            </div>
          </div>

          {/* Support Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-50 text-blue-600 rounded-lg mx-auto mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold text-black mb-2">
                Documentation
              </h4>
              <p className="text-gray-600 text-sm">
                Comprehensive guides and API documentation for all features.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-green-50 text-green-600 rounded-lg mx-auto mb-4">
                <Terminal className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold text-black mb-2">
                Community
              </h4>
              <p className="text-gray-600 text-sm">
                Join our community for support, tips, and best practices.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-50 text-purple-600 rounded-lg mx-auto mb-4">
                <Settings className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold text-black mb-2">Support</h4>
              <p className="text-gray-600 text-sm">
                24/7 support for enterprise customers and priority assistance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
