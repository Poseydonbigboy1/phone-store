export enum SortBy {
  None = 0,
  Price = 1,
  Popularity = 2,
}

export enum SortDirection {
  Ascending = 0,
  Descending = 1,
}

export interface FilterValue {
  componentTitle: string;
  value: string;
  matchMode: 'equals';
}

export interface ProductFilter {
  skip: number;
  take: number;
  sortBy: SortBy;
  sortDirection: SortDirection;
  filterValues: FilterValue[];
}
