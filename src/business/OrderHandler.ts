import { getItemById } from '../repositories/ItemRepository';
import OrderItem from '../domain/OrderItem';
import {
  applyMinimumSpendDiscount,
  applyTwoForOneDiscount,
  getOrderWithoutPacks,
  getPacksQuantity,
  getPacksTotalAmount,
} from './OrderDiscountHandler';

export default class OrderHandler {
  #order: OrderItem[] = [];

  getOrder(): OrderItem[] {
    return this.#order;
  }

  addOrder(itemNumber: number, quantity: number): void {
    if (quantity < 1) return;

    const orderItem = this.#order.find((element) => element.itemNumber === itemNumber);
    if (orderItem) {
      orderItem.quantity += quantity;
      return;
    }
    this.#order.push({ itemNumber, quantity });
  }

  getTotal(): number {
    let subtotal = 0;
    const packsQuantity = getPacksQuantity(this.#order);
    const orderResult = getOrderWithoutPacks(this.#order, packsQuantity);
    subtotal = getPacksTotalAmount(subtotal, packsQuantity);

    orderResult.forEach((orderItem: OrderItem) => {
      const { itemNumber, quantity } = orderItem;
      const item = getItemById(itemNumber);
      if (item) {
        const { price } = item;
        subtotal += price * quantity;
        subtotal = applyTwoForOneDiscount(orderItem, price, subtotal);
      }
    });
    subtotal = applyMinimumSpendDiscount(subtotal);
    return subtotal / 100;
  }
}
