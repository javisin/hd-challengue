import discounts from '../config/discounts.json';
import OrderItem from '../domain/OrderItem';

export const applyTwoForOneDiscount = (
  orderItem: OrderItem,
  price: number,
  subtotal: number,
): number => {
  const { itemIds: discountItemIds } = discounts.twoForOne;
  const { itemNumber, quantity } = orderItem;
  if (discountItemIds.includes(itemNumber)) {
    const itemsToDiscount = Math.floor(quantity / 2);
    const discount = itemsToDiscount * price;
    return subtotal - discount;
  }
  return subtotal;
};

export const applyMinimumSpendDiscount = (subtotal: number) => {
  const { minimumAmount, discountAmount } = discounts.minimumSpend;
  if (subtotal > minimumAmount) {
    return subtotal - discountAmount;
  }
  return subtotal;
};

export const getPacksQuantity = (order: OrderItem[]): number => {
  const { itemIds: discountItemIds } = discounts.pack;
  const hasPack = discountItemIds.length > 0 && discountItemIds.every((itemId) => (
    order.some((element) => element.itemNumber === itemId)));

  if (!hasPack) {
    return 0;
  }

  let packsQuantity = 0;
  order.forEach(({ itemNumber, quantity }) => {
    if (discountItemIds.includes(itemNumber)
      && (quantity < packsQuantity || packsQuantity === 0)) {
      packsQuantity = quantity;
    }
  });
  return packsQuantity;
};

export const getOrderWithoutPacks = (order: OrderItem[], packsQuantity: number): OrderItem[] => {
  const { itemIds: discountItemIds } = discounts.pack;
  return order.map((orderItem) => {
    if (discountItemIds.includes(orderItem.itemNumber)) {
      return {
        ...orderItem,
        quantity: orderItem.quantity - packsQuantity,
      };
    }
    return orderItem;
  });
};

export const getPacksTotalAmount = (subtotal: number, packsQuantity: number) => {
  const { fixedPrice } = discounts.pack;
  return (packsQuantity * fixedPrice) + subtotal;
};
