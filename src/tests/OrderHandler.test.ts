import { beforeEach, expect, test } from '@jest/globals';
import OrderHandler from '../business/OrderHandler';
import discounts from '../config/__mocks__/discounts.json';

const mockGetItemById = jest.fn();

jest.mock('../repositories/ItemRepository', () => ({
  getItemById: jest.fn(() => mockGetItemById()),
}));

jest.mock('../config/discounts.json');

describe('OrderHandler tests', () => {
  let item1Price: number;
  let item2Price: number;
  let item3Price: number;

  beforeEach(() => {
    item1Price = Math.floor(Math.random() * 1000) + 1;
    item2Price = Math.floor(Math.random() * 1000) + 1;
    item3Price = Math.floor(Math.random() * 1000) + 1;
  });

  test('can add different items', () => {
    const orderHandler = new OrderHandler();
    orderHandler.addOrder(1, 2);
    orderHandler.addOrder(2, 1);
    orderHandler.addOrder(3, 3);
    expect(orderHandler.getOrder()).toStrictEqual([
      { itemNumber: 1, quantity: 2 },
      { itemNumber: 2, quantity: 1 },
      { itemNumber: 3, quantity: 3 },
    ]);
  });

  test('add the same item increase the quantity', () => {
    const orderHandler = new OrderHandler();
    orderHandler.addOrder(2, 2);
    orderHandler.addOrder(2, 1);
    expect(orderHandler.getOrder()).toStrictEqual([{ itemNumber: 2, quantity: 3 }]);
  });

  test('non existing items do not count for the total amount', () => {
    const orderHandler = new OrderHandler();
    mockGetItemById.mockReturnValueOnce(null);
    orderHandler.addOrder(3, 2);
    expect(orderHandler.getTotal()).toBe(0);
  });

  test('an item with quantity less than 1 is not added to the order', () => {
    const orderHandler = new OrderHandler();
    orderHandler.addOrder(3, -1);
    expect(orderHandler.getOrder()).toStrictEqual([]);
  });

  test('total amount is calculated properly', () => {
    const orderHandler = new OrderHandler();
    mockGetItemById.mockReturnValueOnce({ price: item1Price });
    orderHandler.addOrder(1, 1);
    mockGetItemById.mockReturnValueOnce({ price: item2Price });
    orderHandler.addOrder(2, 1);

    const total = (item1Price + item2Price) / 100;
    expect(orderHandler.getTotal()).toBe(total);
  });

  test('total amount is calculated properly when a twoForOne discount is applied', () => {
    const orderHandler = new OrderHandler();
    const { itemIds } = discounts.twoForOne;

    mockGetItemById.mockReturnValueOnce({ price: item1Price });
    orderHandler.addOrder(itemIds[0], 2);
    const total = item1Price / 100;
    expect(orderHandler.getTotal()).toBe(total);
  });

  test('total amount is calculated properly when a minimumSpend discount is applied', () => {
    const orderHandler = new OrderHandler();
    const { minimumAmount, discountAmount } = discounts.minimumSpend;

    mockGetItemById.mockReturnValueOnce({ price: minimumAmount });
    orderHandler.addOrder(1, 1);
    mockGetItemById.mockReturnValueOnce({ price: item2Price });
    orderHandler.addOrder(2, 1);
    const total = (minimumAmount + item2Price - discountAmount) / 100;
    expect(orderHandler.getTotal()).toBe(total);
  });

  test('total amount is calculated properly when twoForOne and minimumSpend discounts are combined', () => {
    const orderHandler = new OrderHandler();
    const { minimumAmount, discountAmount } = discounts.minimumSpend;
    const { itemIds } = discounts.twoForOne;

    mockGetItemById.mockReturnValueOnce({ price: minimumAmount });
    orderHandler.addOrder(itemIds[0], 2);
    mockGetItemById.mockReturnValueOnce({ price: item2Price });
    orderHandler.addOrder(0, 3);
    const total = ((minimumAmount + item2Price * 3) - discountAmount) / 100;
    expect(orderHandler.getTotal()).toBe(total);
  });

  test('total amount is calculated properly when pack discount is applied', () => {
    const orderHandler = new OrderHandler();
    const { fixedPrice, itemIds: packItemIds } = discounts.pack;

    packItemIds.forEach((itemId) => {
      mockGetItemById.mockReturnValueOnce({ price: item1Price });
      orderHandler.addOrder(itemId, 1);
    });
    const total = fixedPrice / 100;
    expect(orderHandler.getTotal()).toBe(total);
  });

  test('total amount is calculated properly when multiple pack discounts are applied', () => {
    const orderHandler = new OrderHandler();
    const { fixedPrice, itemIds: packItemIds } = discounts.pack;
    const { minimumAmount, discountAmount } = discounts.minimumSpend;
    const packsQuantity = Math.floor(Math.random() * 10) + 1;

    packItemIds.forEach((itemId) => {
      mockGetItemById.mockReturnValueOnce({ price: item1Price });
      orderHandler.addOrder(itemId, packsQuantity);
    });

    const packsTotalAmount = fixedPrice * packsQuantity;
    const minimumSpendDiscount = packsTotalAmount > minimumAmount
      ? discountAmount : 0;
    const total = (packsTotalAmount - minimumSpendDiscount) / 100;
    expect(orderHandler.getTotal()).toBe(total);
  });

  test('total amount is calculated properly when twoForOne, minimumSpend and pack discounts are combined', () => {
    const orderHandler = new OrderHandler();
    const { minimumAmount, discountAmount } = discounts.minimumSpend;
    const { fixedPrice, itemIds: packItemIds } = discounts.pack;
    const { itemIds: twoForOneItemIds } = discounts.twoForOne;
    const twoForOneItemPrice = minimumAmount;

    mockGetItemById.mockReturnValueOnce({ price: twoForOneItemPrice });
    orderHandler.addOrder(twoForOneItemIds[0], 3);
    mockGetItemById.mockReturnValueOnce({ price: item2Price });
    orderHandler.addOrder(packItemIds[1], 1);
    mockGetItemById.mockReturnValueOnce({ price: item3Price });
    orderHandler.addOrder(packItemIds[2], 1);
    const total = (fixedPrice + twoForOneItemPrice - discountAmount) / 100;
    expect(orderHandler.getTotal()).toBe(total);
  });
});
