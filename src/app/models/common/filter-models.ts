export interface FilterItem {
  matchMode: string;
  value: string;
}

export interface FilterResult<T> {
  items: T[];
  total: number;
}

export interface BrandFilter {
  skip: number;
  take: number;
  sortBy: string | null;
  sortDirection: number;
  id: FilterItem;
  title: FilterItem;
}
