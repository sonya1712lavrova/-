import type { Warehouse, PickupPoint } from './types';

const API_BASE = '/api';

// Business pickup points (no UI yet)
export async function getBusinessPickupPoints() {
  const response = await fetch(`${API_BASE}/business-pickup-points`);
  if (!response.ok) throw new Error('Failed to fetch business pickup points');
  return response.json();
}

export async function getWarehouseBusinessPickupPoints(warehouseId: string) {
  const response = await fetch(`${API_BASE}/warehouses/${warehouseId}/business-pickup-points`);
  if (!response.ok) throw new Error('Failed to fetch warehouse business pickup points');
  return response.json();
}

// Create business pickup point (full form payload)
export async function createBusinessPickupPoint(payload: any) {
  const response = await fetch(`${API_BASE}/business-pickup-points`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.errors ? JSON.stringify(err.errors) : 'Failed to create business pickup point');
  }
  return response.json();
}

// Update business pickup point
export async function updateBusinessPickupPoint(id: string, payload: any) {
  const response = await fetch(`${API_BASE}/business-pickup-points/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.errors ? JSON.stringify(err.errors) : 'Failed to update business pickup point');
  }
  return response.json();
}

// Get all warehouse-business links
export async function getWarehouseBusinessLinks() {
  const response = await fetch(`${API_BASE}/warehouse-business-links`);
  if (!response.ok) throw new Error('Failed to fetch warehouse business links');
  return response.json();
}

export async function getWarehouses(): Promise<Warehouse[]> {
  try {
  const response = await fetch(`${API_BASE}/warehouses`);
  if (!response.ok) throw new Error('Failed to fetch warehouses');
  return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Не удалось подключиться к серверу. Убедитесь, что сервер запущен на порту 3001.');
    }
    throw error;
  }
}

export async function getWarehouse(): Promise<Warehouse> {
  const response = await fetch(`${API_BASE}/warehouse`);
  if (!response.ok) throw new Error('Failed to fetch warehouse');
  return response.json();
}

export async function getPickupPoints(): Promise<PickupPoint[]> {
  try {
  const response = await fetch(`${API_BASE}/pickup-points`);
  if (!response.ok) throw new Error('Failed to fetch pickup points');
  return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Не удалось подключиться к серверу. Убедитесь, что сервер запущен на порту 3001.');
    }
    throw error;
  }
}

// Delete business pickup point
export async function deleteBusinessPickupPoint(id: string) {
  const response = await fetch(`${API_BASE}/business-pickup-points/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete business pickup point');
  }
  return response.json();
}

