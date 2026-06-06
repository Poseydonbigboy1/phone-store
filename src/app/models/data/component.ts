export interface Component {
  id: string;
  title: string;
  description: string;
  dataType: number;
  categoryType: number;
  componentCategoryId: string;
}

export const DATA_TYPE_LABELS: Record<number, string> = {
  0: 'STRING',
  1: 'INT',
  2: 'DOUBLE',
  3: 'BOOLEAN',
};
