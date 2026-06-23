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
              // filterValue — «сырое» значение для бэка (для boolean это 'true',
              // тогда как title содержит отображаемое «Да»)
              value: item.filterValue ?? item.title,
              matchMode: 'equals',
            });
          }
          if (item.type === 'rangeInt' && Array.isArray(item.value)) {
            filterValues.push({
              componentTitle: group.title,
              value: String(item.value[0]),
              matchMode: 'gte',
            });
            filterValues.push({
              componentTitle: group.title,
              value: String(item.value[1]),
              matchMode: 'lte',
            });
          }
        });
      }
    });

    return filterValues;
  }
}
