import { FilterValue } from 'src/app/models/common/product-filter';

export class FilterRequestConverter {
  public static transform(filters: any[]): FilterValue[] {
    const filterValues: FilterValue[] = [];

    if (!filters) {
      return filterValues;
    }

    filters.forEach((group) => {
      if (group.type === 'group' && Array.isArray(group.value)) {
        group.value.forEach((item: any) => {
          if (item.type === 'checkbox' && item.value === true) {
            filterValues.push({
              componentTitle: group.title,
              value: item.title,
              matchMode: 'equals',
            });
          }
          // Backend request format for other filter types (e.g., range) is not specified.
          // Only checkbox filters are handled for now.
        });
      }
    });

    return filterValues;
  }
}
