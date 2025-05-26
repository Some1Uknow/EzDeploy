import { TrendingUp, Users, Zap, Globe, BarChart3, Activity } from 'lucide-react';

export default function Analytics() {
  const metrics = [
    {
      label: 'Total Deployments',
      value: '12,547',
      change: '+23%',
      trend: 'up',
      icon: Zap,
      color: 'text-green-600'
    },
    {
      label: 'Active Projects',
      value: '2,341',
      change: '+12%',
      trend: 'up',
      icon: Globe,
      color: 'text-blue-600'
    },
    {
      label: 'Success Rate',
      value: '99.2%',
      change: '+0.3%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      label: 'Active Users',
      value: '8,912',
      change: '+18%',
      trend: 'up',
      icon: Users,
      color: 'text-orange-600'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-4">
            Platform Analytics
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time insights into deployment performance, user activity, and platform health.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {metrics.map((metric, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-2xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-sm transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-white`}>
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div className={`text-sm font-medium ${metric.color}`}>
                  {metric.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-black mb-1">
                {metric.value}
              </div>
              <div className="text-gray-600 text-sm">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-black">Deployment Trends</h3>
              <div className="flex items-center text-sm text-gray-600">
                <Activity className="w-4 h-4 mr-2" />
                Last 30 days
              </div>
            </div>
            
            {/* Mock Chart */}
            <div className="h-64 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Deployment frequency chart</p>
                <p className="text-gray-500 text-sm">Interactive charts would be here</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-black">Success Rate</h3>
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="w-4 h-4 mr-2" />
                Real-time
              </div>
            </div>
            
            {/* Mock Chart */}
            <div className="h-64 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="w-full h-full rounded-full border-8 border-gray-200"></div>
                  <div className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-green-500 border-r-transparent transform rotate-45"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-black">99.2%</span>
                  </div>
                </div>
                <p className="text-gray-600">Success rate visualization</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="mt-16 bg-black rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Performance Metrics</h3>
            <p className="text-gray-400">Real-time platform performance indicators</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">28.3s</div>
              <div className="text-gray-400 text-sm">Avg Deploy Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">99.9%</div>
              <div className="text-gray-400 text-sm">Platform Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2"> 100ms</div>
              <div className="text-gray-400 text-sm">API Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-gray-400 text-sm">Monitoring</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
