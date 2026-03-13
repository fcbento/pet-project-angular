export interface TableColumn<T> {
  label: string;
  field: keyof T | string;
  width?: string;
  sortable?: boolean;
  cell?: (row: T) => string | null;
}

export interface TableAction<T> {
  label: string;
  icon?: string;
  callback: (row: T) => void;
}
