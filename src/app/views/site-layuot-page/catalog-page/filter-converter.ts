export class FilterConverter {
  /**
   * Конвертирует сырой массив фильтров в сгруппированную структуру для UI
   */
  static transform(rawData: any[]): any[] {
    const grouped = new Map<string, any>();

    rawData.forEach((item) => {
      const title = item.group_title;

      // Если такой группы еще нет — создаем её
      if (!grouped.has(title)) {
        grouped.set(title, {
          type: 'group',
          title: title,
          value: [],
        });
      }

      const group = grouped.get(title)!;

      // Очищаем значение от лишних экранированных кавычек, если они есть
      let cleanTitle = item.filter_value.replace(/^"|"$/g, '');

      // Для булевых значений (data_type: 3) меняем 'true' на более понятный текст, например 'Да'
      if (item.data_type === 3 && cleanTitle === 'true') {
        cleanTitle = 'Да';
      }

      // Добавляем опцию в группу (по умолчанию все дискретные значения делаем чекбоксами)
      group.value.push({
        type: 'checkbox',
        title: cleanTitle,
        value: false,
      });
    });

    // Преобразуем Map обратно в массив
    return Array.from(grouped.values());
  }
}
