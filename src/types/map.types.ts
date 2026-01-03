export interface MapStatisticItem {
  value: string;
  label: string;
  variant?: "primary";
}

export interface MapStatisticsData {
  total: number;
  public: number;
  private: number;
  mixed: number;
  temporary: number;
}
