export interface MockMerchant {
  id: string;
  shopName: string;
  ownerName: string;
  contactEmail: string;
  contactPhone: string;
  status: string;
  createdAt: string;
}

export const mockMerchants: MockMerchant[] = [
  { id: '1', shopName: 'ຮ້ານສິນຄ້າ A', ownerName: 'ທ້າວ ອານຸ', contactEmail: 'merchant@example.com', contactPhone: '020 1234 5678', status: 'active', createdAt: '2026-01-15' },
  { id: '2', shopName: 'ຮ້ານສິນຄ້າ B', ownerName: 'ນາງ ບົວລີ', contactEmail: 'merchant2@example.com', contactPhone: '020 9876 5432', status: 'active', createdAt: '2026-01-20' },
  { id: '3', shopName: 'ຮ້ານສິນຄ້າ C', ownerName: 'ທ້າວ ວິໄລ', contactEmail: 'merchant3@example.com', contactPhone: '020 5555 1234', status: 'inactive', createdAt: '2026-01-25' },
];
