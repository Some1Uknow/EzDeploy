import { ArrowRight, Zap, Globe, Shield } from 'lucide-react';

export default function Hero() {
  return (
    <section className="pt-32 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium text-gray-700 mb-8">
            <Zap className="w-4 h-4 mr-2 text-black" />
            Modern Cloud-Native Deployment Platform
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-black leading-tight tracking-tight mb-8">
            Deploy Any Web App
            <br />
            <span className="bg-gradient-to-r from-gray-600 to-gray-400 bg-clip-text text-transparent">
              In Seconds
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            EzDeploy enables seamless deployment of web applications directly from Git repositories. 
            Built with microservices architecture for automatic scaling and real-time monitoring.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href="#deploy"
              className="inline-flex items-center px-8 py-4 bg-black text-white font-medium rounded-lg hover:bg-gray-900 transition-all duration-200 group min-w-[200px] justify-center"
            >
              Start Deploying
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </a>
            <a
              href="#architecture"
              className="inline-flex items-center px-8 py-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 hover:text-black transition-all duration-200 min-w-[200px] justify-center"
            >
              View Architecture
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg mx-auto mb-4">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <div className="text-3xl font-bold text-black mb-2">30s</div>
              <div className="text-gray-600">Average Deploy Time</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg mx-auto mb-4">
                <Globe className="w-6 h-6 text-black" />
              </div>
              <div className="text-3xl font-bold text-black mb-2">99.9%</div>
              <div className="text-gray-600">Uptime Guarantee</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg mx-auto mb-4">
                <Shield className="w-6 h-6 text-black" />
              </div>
              <div className="text-3xl font-bold text-black mb-2">100%</div>
              <div className="text-gray-600">Secure Deployments</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
