import items from '../data/items.json';

interface Item {
  number: number,
  price: number,
  name: string
}

export const getItemById = (number: number): Item | null => {
  const item = items.find((element) => element.number === number);
  return item ?? null;
};
