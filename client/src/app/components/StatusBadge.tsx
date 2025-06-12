import { CheckCircle, XCircle, Clock, AlertCircle, Timer } from 'lucide-react';

interface StatusBadgeProps {
  status: 'success' | 'error' | 'pending' | 'warning' | 'queued';
  text: string;
  className?: string;
}

export default function StatusBadge({ status, text, className = '' }: StatusBadgeProps) {
  const configs = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      iconColor: 'text-green-500',
      borderColor: 'border-green-200'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      iconColor: 'text-red-500',
      borderColor: 'border-red-200'
    },
    pending: {
      icon: Clock,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      iconColor: 'text-yellow-500',
      borderColor: 'border-yellow-200'
    },    warning: {
      icon: AlertCircle,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      iconColor: 'text-orange-500',
      borderColor: 'border-orange-200'
    },
    queued: {
      icon: Timer,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-200'
    }
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}>
      <Icon className={`w-4 h-4 mr-2 ${config.iconColor}`} />
      {text}
    </div>
  );
}
