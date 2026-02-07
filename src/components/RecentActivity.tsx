import React from 'react';

export interface ActivityItem {
  id: string;
  type: 'fill' | 'batch' | 'export';
  providerName?: string;
  providerCount?: number;
  fileName: string;
  timestamp: Date;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  onClear: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  onClear,
}) => {
  if (activities.length === 0) return null;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'fill':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'batch':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'export':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  const getDescription = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'fill':
        return `Filled for ${activity.providerName}`;
      case 'batch':
        return `Batch filled for ${activity.providerCount} providers`;
      case 'export':
        return `Exported ${activity.providerName}'s data`;
    }
  };

  return (
    <div className="bg-white dark:bg-[#1e1e28] rounded-lg border border-[#e5e2dd] dark:border-[#2a2a38] overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#e5e2dd] dark:border-[#2a2a38]">
        <h3 className="text-sm font-medium text-[#1a1a2e] dark:text-[#e8e6e3]">
          Recent Activity
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-[#6b7280] hover:text-[#c45d3a]"
        >
          Clear
        </button>
      </div>
      <div className="divide-y divide-[#e5e2dd] dark:divide-[#2a2a38]">
        {activities.slice(0, 5).map(activity => (
          <div key={activity.id} className="px-4 py-3 flex items-start gap-3">
            <span className={`mt-0.5 ${
              activity.type === 'fill' ? 'text-[#2d7a5f]' :
              activity.type === 'batch' ? 'text-[#c45d3a]' :
              'text-[#6b7280]'
            }`}>
              {getIcon(activity.type)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#1a1a2e] dark:text-[#e8e6e3] truncate">
                {getDescription(activity)}
              </p>
              <p className="text-xs text-[#6b7280] dark:text-[#8b8b9b] truncate">
                {activity.fileName}
              </p>
            </div>
            <span className="text-xs text-[#9a9590] whitespace-nowrap">
              {formatTime(activity.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper to manage activity in localStorage
const ACTIVITY_KEY = 'pff_recent_activity';

export const saveActivity = (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
  const stored = localStorage.getItem(ACTIVITY_KEY);
  const activities: ActivityItem[] = stored ? JSON.parse(stored) : [];
  
  const newActivity: ActivityItem = {
    ...activity,
    id: Date.now().toString(),
    timestamp: new Date(),
  };
  
  activities.unshift(newActivity);
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities.slice(0, 20)));
  
  return newActivity;
};

export const loadActivities = (): ActivityItem[] => {
  const stored = localStorage.getItem(ACTIVITY_KEY);
  if (!stored) return [];
  
  const activities = JSON.parse(stored);
  return activities.map((a: any) => ({
    ...a,
    timestamp: new Date(a.timestamp),
  }));
};

export const clearActivities = () => {
  localStorage.removeItem(ACTIVITY_KEY);
};

