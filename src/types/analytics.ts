import { AnalyticsData, AnalyticsTabKey } from '../hooks/useAdminAnalytics';

export interface AnalyticsKPIHeaderProps {
  data: AnalyticsData | null;
  timeframe: '7d' | '30d' | '90d' | 'all';
  setTimeframe: (t: '7d' | '30d' | '90d' | 'all') => void;
  activeTab: AnalyticsTabKey;
  setActiveTab: (t: AnalyticsTabKey) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export interface AnalyticsTabItem {
  key: AnalyticsTabKey;
  label: string;
  icon: string;
}
