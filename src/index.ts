import OrderHandler from './business/OrderHandler';

const order = new OrderHandler();

order.addOrder(2, 1);
order.addOrder(37, 6);
order.addOrder(21, 4);

console.log(order.getOrder());
console.log(order.getTotal());
