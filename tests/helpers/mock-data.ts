/**
 * Mock data สำหรับ API responses ใน E2E tests
 */

export const mockExchangeRates = {
  results: [
    {
      id: 1,
      baseCurrency: 'THB',
      targetCurrency: 'LAK',
      rateType: 'BUY',
      rate: '3200',
      isActive: true,
      rateDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      baseCurrency: 'THB',
      targetCurrency: 'LAK',
      rateType: 'SELL',
      rate: '3150',
      isActive: true,
      rateDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      baseCurrency: 'CNY',
      targetCurrency: 'LAK',
      rateType: 'BUY',
      rate: '1800',
      isActive: true,
      rateDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: 4,
      baseCurrency: 'CNY',
      targetCurrency: 'LAK',
      rateType: 'SELL',
      rate: '1780',
      isActive: true,
      rateDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ],
};

export const mockCustomers = {
  results: [
    {
      id: 1,
      customerName: 'ສົມໃຈ ວົງສີ',
      uniqueToken: 'CUST-001',
      contactPhone: '020-1234-5678',
      shippingAddress: 'ວຽງຈັນ, ລາວ',
      shippingProvider: 'EMS',
      paymentTerms: 'COD',
      isActive: true,
      merchantId: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      customerName: 'ບຸນຮັກ ສີຫານ',
      uniqueToken: 'CUST-002',
      contactPhone: '020-9876-5432',
      shippingAddress: 'ສະຫວັນ, ລາວ',
      shippingProvider: 'J&T',
      paymentTerms: 'Transfer',
      isActive: true,
      merchantId: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      customerName: 'ນາງ ມາລີ ຄໍາ',
      uniqueToken: 'CUST-003',
      contactPhone: '020-5555-1234',
      shippingAddress: 'ປາກເຊ, ລາວ',
      shippingProvider: 'Flash',
      paymentTerms: 'Credit',
      isActive: false,
      merchantId: 1,
      createdAt: new Date().toISOString(),
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 3,
    totalPages: 1,
  },
  summary: {
    totalCustomers: 3,
    totalActive: 2,
    totalInactive: 1,
  },
};

export const mockOrders = {
  results: [
    {
      id: 1,
      orderCode: 'ORD-2026-001',
      orderDate: new Date().toISOString(),
      arrivalStatus: 'NOT_ARRIVED',
      paymentStatus: 'UNPAID',
      orderItems: [{ id: 1 }, { id: 2 }],
      totalFinalCostLak: '12800000',
      totalSellingAmountLak: '15000000',
      totalProfitLak: '2200000',
      merchantId: 1,
    },
    {
      id: 2,
      orderCode: 'ORD-2026-002',
      orderDate: new Date().toISOString(),
      arrivalStatus: 'ARRIVED',
      paymentStatus: 'PAID',
      orderItems: [{ id: 3 }],
      totalFinalCostLak: '6400000',
      totalSellingAmountLak: '7500000',
      totalProfitLak: '1100000',
      merchantId: 1,
    },
  ],
  pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
  summary: {
    totalOrders: 2,
    totalFinalCostLak: '19200000',
    totalSellingAmountLak: '22500000',
    totalProfitLak: '3300000',
  },
};

export const mockOrderDetail = {
  id: 1,
  orderCode: 'ORD-2026-001',
  orderDate: new Date().toISOString(),
  arrivalStatus: 'NOT_ARRIVED',
  paymentStatus: 'UNPAID',
  orderItems: [
    {
      id: 1,
      productName: 'ສິນຄ້າ A',
      variant: 'ສີແດງ',
      quantity: 10,
      purchasePrice: 800,
      shippingPrice: 0,
      discountValue: 0,
      sellingPriceForeign: 150,
    },
  ],
  customerOrders: [],
  merchantId: 1,
};

export const mockCreateOrderResponse = {
  id: 99,
  orderCode: 'ORD-TEST-001',
  orderDate: new Date().toISOString(),
  arrivalStatus: 'NOT_ARRIVED',
  paymentStatus: 'UNPAID',
};

export const mockLoginSuccess = {
  access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcklkIjoxLCJlbWFpbCI6Im1lcmNoYW50QHRlc3QuY29tIiwiZnVsbE5hbWUiOiJUZXN0IE1lcmNoYW50Iiwicm9sZU5hbWUiOiJhZG1pbl9tZXJjaGFudCIsIm1lcmNoYW50SWQiOjEsImV4cCI6OTk5OTk5OTk5OSwiaWF0IjoxNzAwMDAwMDAwfQ.fakesignature',
};

export const mockDashboard = {
  totalOrders: 2,
  totalCustomers: 3,
  totalRevenue: '22500000',
  totalProfit: '3300000',
  recentOrders: [],
};

export const mockArrivals = {
  results: [
    {
      id: 1,
      orderId: 1,
      orderCode: 'ORD-2026-001',
      arrivedDate: new Date().toISOString(),
      arrivedTime: '10:30',
      itemsCount: 2,
      notes: 'ສິນຄ້າໄດ້ຮັບຄົບ',
    },
  ],
  pagination: { page: 1, limit: 10, total: 1 },
};

export const mockPayments = {
  results: [
    {
      id: 1,
      orderId: 1,
      orderCode: 'ORD-2026-001',
      customerId: 1,
      customerName: 'ສົມໃຈ ວົງສີ',
      customerMessage: 'ໂອນແລ້ວ',
      paymentAmount: '1500000',
      paymentDate: new Date().toISOString(),
      paymentProof: 'https://example.com/proof.jpg',
      status: 'PENDING',
    },
  ],
  pagination: { page: 1, limit: 10, total: 1 },
  summary: {
    totalPayments: 1,
    totalAmount: '1500000',
    pendingCount: 1,
    verifiedCount: 0,
    rejectedCount: 0,
  },
};

export const mockExchangeRateList = {
  results: [
    {
      id: 1,
      baseCurrency: 'THB',
      targetCurrency: 'LAK',
      rateType: 'BUY',
      rate: '3200',
      isActive: true,
      rateDate: new Date().toISOString(),
    },
    {
      id: 2,
      baseCurrency: 'THB',
      targetCurrency: 'LAK',
      rateType: 'SELL',
      rate: '3150',
      isActive: true,
      rateDate: new Date().toISOString(),
    },
  ],
  pagination: { page: 1, limit: 10, total: 2 },
};
