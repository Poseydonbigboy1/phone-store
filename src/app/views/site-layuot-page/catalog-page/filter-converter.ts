export class FilterConverter {
  static transform(rawData: any[]): any[] {
    const grouped = new Map<string, any>();

    rawData.forEach((item) => {
      const title = item.group_title;

      if (!grouped.has(title)) {
        grouped.set(title, {
          type: 'group',
          title: title,
          value: [],
        });
      }

      const group = grouped.get(title)!;

      if (item.data_type === 1) {
        let rangeOption = group.value.find((v: any) => v.type === 'rangeInt');
        const numValue = Number(item.filter_value);

        if (!rangeOption) {
          // Если это первое значение, создаем объект и ставим одинаковые границы [min, max]
          rangeOption = {
            type: 'rangeInt',
            title: null,
            value: [numValue, numValue],
          };
          group.value.push(rangeOption);
        } else {
          rangeOption.value[0] = Math.min(rangeOption.value[0], numValue);
          rangeOption.value[1] = Math.max(rangeOption.value[1], numValue);
        }
        return;
      }

      let cleanTitle = String(item.filter_value).replace(/^"|"$/g, '');

      if (item.data_type === 3 && cleanTitle === 'true') {
        cleanTitle = 'Да';
      }

      group.value.push({
        type: 'checkbox',
        title: cleanTitle,
        value: false,
      });
    });

    return Array.from(grouped.values());
  }
}
