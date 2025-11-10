import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DeliveryMethods } from './components/DeliveryMethods';
import { RightSidebar } from './components/RightSidebar';
import { PickupPointsModal } from './components/PickupPointsModal';
import { PvzPage } from './components/PvzPage';
import { AllWarehousesPage } from './components/AllWarehousesPage';
import { BusinessPickupPage } from './components/BusinessPickupPage';
import { Chip } from './components/Chip';
import { getWarehouse, getWarehouses, getPickupPoints } from './api';
import type { Warehouse, PickupPoint } from './types';
import './App.css';

function App() {
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPickupPointsModalOpen, setIsPickupPointsModalOpen] = useState(false);
  const [page, setPage] = useState<'warehouse' | 'pvz' | 'all-warehouses' | 'business-pvz'>('warehouse');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('wh-1');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [warehousesData, pickupPointsData] = await Promise.all([
          getWarehouses(),
          getPickupPoints()
        ]);
        setWarehouses(warehousesData);
        setWarehouse(warehousesData[0] || null);
        setPickupPoints(pickupPointsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="app">
        <Header />
        <main className="main-content">
          <div style={{ textAlign: 'center', padding: 48 }}>Загрузка...</div>
        </main>
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="app">
        <Header />
        <main className="main-content">
          <div style={{ textAlign: 'center', padding: 48, color: '#d32f2f' }}>
            Ошибка: {error || 'Не удалось загрузить данные'}
          </div>
        </main>
      </div>
    );
  }

  const handleWarehouseClick = (warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
    const selected = warehouses.find(w => w.id === warehouseId);
    if (selected) {
      setWarehouse(selected);
    }
    setPage('warehouse');
  };

  // Convert warehouses to AllWarehousesPage format
  const allWarehousesData = warehouses.map(w => ({
    id: w.id,
    name: w.name,
    address: w.address,
    status: w.id === 'wh-2' ? ('pending' as const) : ('active' as const),
    statusText: w.id === 'wh-2' ? 'ожидает подключения' : '',
    organization: 'ООО КОМЕКОМ (№1926367/21)'
  }));

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {page === 'all-warehouses' ? (
          <AllWarehousesPage 
            warehouses={allWarehousesData}
            onWarehouseClick={handleWarehouseClick}
            chips={warehouses.map(w => ({ id: w.id, name: w.name }))}
            selectedChipId={selectedWarehouseId || 'all'}
            onSelectAll={() => {
              setSelectedWarehouseId('all');
              setPage('all-warehouses');
            }}
            onSelectWarehouse={(id) => {
              handleWarehouseClick(id);
            }}
            onOpenBusiness={() => setPage('business-pvz')}
          />
        ) : page === 'pvz' ? (
          <PvzPage pickupPoints={pickupPoints} onBack={() => setPage('warehouse')} />
        ) : page === 'business-pvz' ? (
          <BusinessPickupPage
            warehouses={warehouses}
            onBack={() => setPage('all-warehouses')}
          />
        ) : (
          <div className="warehouse-page">
        <div className="page-header">
          <h1 className="page-title">Склады</h1>
          <div className="page-header-actions" style={{ marginLeft: 'auto' }}>
            <button className="btn-primary">Добавить</button>
          </div>
        </div>

        <div className="tabs">
          <Chip
            label="Все склады"
            desc={warehouses.length.toString()}
            selected={selectedWarehouseId === 'all'}
            onClick={() => {
              setSelectedWarehouseId('all');
              setPage('all-warehouses');
            }}
          />
          {warehouses.map((wh) => (
            <Chip
              key={wh.id}
              label={wh.name}
              icon={
                wh.id === 'wh-2' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M3.28593 3.28593C4.53618 2.03569 6.23187 1.33331 7.99998 1.33331C9.76809 1.33331 11.4638 2.03569 12.714 3.28593C13.9643 4.53618 14.6666 6.23187 14.6666 7.99998C14.6666 9.76809 13.9643 11.4638 12.714 12.714C11.4638 13.9643 9.76809 14.6666 7.99998 14.6666C6.23187 14.6666 4.53618 13.9643 3.28593 12.714C2.03569 11.4638 1.33331 9.76809 1.33331 7.99998C1.33331 6.23187 2.03569 4.53618 3.28593 3.28593ZM8.66665 4.00503L8.83331 7.6548L10.4193 9.59096L9.54425 10.466L7.16665 8.34516L7.33331 3.99998L8.66665 4.00503Z" fill="currentColor"/>
                  </svg>
                ) : undefined
              }
              selected={selectedWarehouseId === wh.id && page === 'warehouse'}
              onClick={() => {
                setSelectedWarehouseId(wh.id);
                setWarehouse(wh);
              }}
            />
          ))}
        </div>

        <div className="warehouse-layout">
          <div>
            <DeliveryMethods 
              pickupPointsCount={pickupPoints.length}
              onViewPickupPoints={() => setPage('pvz')}
              isPending={warehouse?.id === 'wh-2'}
            />
          </div>
          <div>
              <RightSidebar warehouse={warehouse} showReturns={warehouse?.id !== 'wh-2'} />
          </div>
        </div>
          </div>
        )}
      </main>

      {/* Modal retained for future if needed */}
      {/* <PickupPointsModal
        isOpen={isPickupPointsModalOpen}
        onClose={() => setIsPickupPointsModalOpen(false)}
        pickupPoints={pickupPoints}
      /> */}
    </div>
  );
}

export default App;

