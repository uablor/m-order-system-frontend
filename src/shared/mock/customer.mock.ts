export interface MockCustomer {
  id: string;
  name: string;
  customerType: string;
  contactPhone: string;
  contactLine: string;
  status: string;
}

export const mockCustomers: MockCustomer[] = [
  { id: '1', name: 'ລູກຄ້າ ທີ 1', customerType: 'ຕົວແທນ', contactPhone: '020 1111 1111', contactLine: '@customer1', status: 'active' },
  { id: '2', name: 'ລູກຄ້າ ທີ 2', customerType: 'ຕົວແທນ', contactPhone: '020 2222 2222', contactLine: '@customer2', status: 'active' },
  { id: '3', name: 'ລູກຄ້າ ທີ 3', customerType: 'ປົກກະຕິ', contactPhone: '020 3333 3333', contactLine: '@customer3', status: 'inactive' },
];
