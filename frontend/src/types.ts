export interface Warehouse {
  id: string;
  name: string;
  address: string;
}

export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  warehouseId: string;
  phone?: string;
  workingHours?: string;
}

export interface DeliveryMethod {
  id: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
}

