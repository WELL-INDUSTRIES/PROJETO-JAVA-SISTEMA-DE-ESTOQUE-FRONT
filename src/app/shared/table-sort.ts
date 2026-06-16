export interface SortState<T extends string> {
  column: T;
  direction: 'asc' | 'desc';
}

export type SortDirection = SortState<string>['direction'];

export interface SortColumnConfig<Item> {
  accessor?: (item: Item) => string | number | undefined;
  comparator?: (a: Item, b: Item, direction: SortDirection) => number;
  initialDirection?: SortDirection;
}

export type SortConfig<Item, Column extends string> = Partial<Record<Column, SortColumnConfig<Item>>>;

export function toggleSort<Item, Column extends string>(
  state: SortState<Column>,
  column: Column,
  config: SortConfig<Item, Column>
): SortState<Column> {
  if (state.column === column) {
    return { column, direction: state.direction === 'asc' ? 'desc' : 'asc' };
  }
  const initial = config[column]?.initialDirection ?? 'asc';
  return { column, direction: initial };
}

export function sortItems<Item, Column extends string>(
  items: Item[],
  state: SortState<Column>,
  config: SortConfig<Item, Column>
): Item[] {
  const sorted = [...items];
  const columnConfig = config[state.column];
  if (!columnConfig) return sorted;

  const { comparator, accessor } = columnConfig;
  const compare = comparator
    ? (a: Item, b: Item) => comparator(a, b, state.direction)
    : (a: Item, b: Item) => {
        const av = accessor ? accessor(a) : undefined;
        const bv = accessor ? accessor(b) : undefined;
        return compareValues(av, bv, state.direction);
      };

  sorted.sort(compare);
  return sorted;
}

export function compareValues(
  a: string | number | undefined,
  b: string | number | undefined,
  direction: SortDirection
): number {
  if (a === undefined && b === undefined) return 0;
  if (a === undefined) return direction === 'asc' ? 1 : -1;
  if (b === undefined) return direction === 'asc' ? -1 : 1;

  const cmp = a < b ? -1 : a > b ? 1 : 0;
  return direction === 'asc' ? cmp : -cmp;
}

export function compareNumbers(
  a: number,
  b: number,
  direction: SortDirection
): number {
  const cmp = a - b;
  return direction === 'asc' ? cmp : -cmp;
}

export function compareDates(
  a: string | undefined,
  b: string | undefined,
  direction: SortDirection
): number {
  if (!a && !b) return 0;
  if (!a) return direction === 'asc' ? 1 : -1;
  if (!b) return direction === 'asc' ? -1 : 1;
  const cmp = a < b ? -1 : a > b ? 1 : 0;
  return direction === 'asc' ? cmp : -cmp;
}

export function compareDigits(
  a: string | undefined,
  b: string | undefined,
  direction: SortDirection
): number {
  const aNum = a ? parseInt(a.replace(/\D/g, ''), 10) : 0;
  const bNum = b ? parseInt(b.replace(/\D/g, ''), 10) : 0;
  const cmp = aNum - bNum;
  return direction === 'asc' ? cmp : -cmp;
}

export function comparePresenceThenText(
  a: string | undefined,
  b: string | undefined,
  direction: SortDirection
): number {
  const hasA = !!a;
  const hasB = !!b;
  if (hasA !== hasB) {
    const cmp = hasA ? -1 : 1;
    return direction === 'asc' ? cmp : -cmp;
  }
  if (!hasA && !hasB) return 0;
  const cmp = (a ?? '') < (b ?? '') ? -1 : (a ?? '') > (b ?? '') ? 1 : 0;
  return direction === 'asc' ? cmp : -cmp;
}

export function toNumber(value: number | undefined): number {
  return value ?? 0;
}
