export interface MockOrder {
  id: string;
  orderCode: string;
  orderDate: string;
  customerName: string;
  totalAmount: number;
  paymentStatus: string;
  arrivalStatus: string;
}

export const mockOrders: MockOrder[] = [
  { id: '1', orderCode: 'ORD-001', orderDate: '2026-01-28', customerName: 'ລູກຄ້າ ທີ 1', totalAmount: 1500000, paymentStatus: 'paid', arrivalStatus: 'arrived' },
  { id: '2', orderCode: 'ORD-002', orderDate: '2026-01-29', customerName: 'ລູກຄ້າ ທີ 2', totalAmount: 2300000, paymentStatus: 'pending', arrivalStatus: 'arrived' },
  { id: '3', orderCode: 'ORD-003', orderDate: '2026-01-30', customerName: 'ລູກຄ້າ ທີ 3', totalAmount: 980000, paymentStatus: 'partial', arrivalStatus: 'pending' },
];
