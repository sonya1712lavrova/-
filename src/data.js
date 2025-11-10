'use strict';

/** @type {import('./models').Warehouse[]} */
const warehouses = [
  {
    id: 'wh-1',
    name: 'Склад Москва',
    address: 'г. Москва, ул. Примерная, д. 1'
  },
  {
    id: 'wh-2',
    name: 'Склад Казань',
    address: 'г. Казань, ул. Баумана, д. 58'
  }
];

// Keep backward compatibility
const warehouse = warehouses[0];

/** @type {import('./models').PickupPoint[]} */
const pickupPoints = [
  {
    id: 'pvz-1',
    name: 'Новинский',
    address: 'Москва, Новинский бульвар, д. 8',
    warehouseId: warehouse.id,
    phone: '+7 (495) 000-00-01',
    workingHours: 'Пн–Пт, 10:00–23:00\nСб–Вс, 09:00–18:00'
  },
  {
    id: 'pvz-2',
    name: 'Варшавка',
    address: 'Москва, Варшавское шоссе, д. 97, Ритейл Парк',
    warehouseId: warehouse.id,
    phone: '+7 (495) 000-00-02',
    workingHours: 'Ежедневно, 10:00–23:00'
  },
  {
    id: 'pvz-3',
    name: 'Боровское',
    address: 'Москва, Багратионовский проезд, д. 5',
    warehouseId: warehouse.id,
    phone: '+7 (495) 000-00-03',
    workingHours: 'Ежедневно, 10:00–23:00'
  },
  {
    id: 'pvz-4',
    name: 'Филион',
    address: 'Москва, Сосенское, Калужское шоссе, д. 10, стр. 8, км. 0',
    warehouseId: warehouse.id,
    phone: '+7 (495) 000-00-04',
    workingHours: 'Ежедневно, 10:00–23:00'
  },
  {
    id: 'pvz-5',
    name: 'Белая дача',
    address: 'Москва, Говорово, МКАД, д. с22',
    warehouseId: warehouse.id,
    phone: '+7 (495) 000-00-05',
    workingHours: 'Пн–выходной\nВт–Вс, 10:00–23:00'
  },
  {
    id: 'pvz-6',
    name: 'Невский',
    address: 'Санкт-Петербург, Невский проспект, д. 15',
    warehouseId: warehouse.id,
    phone: '+7 (812) 000-00-06',
    workingHours: 'Пн–Пт, 10:00–23:00\nСб–Вс, 09:00–18:00'
  },
  {
    id: 'pvz-7',
    name: 'Бауманская',
    address: 'Казань, Баумана улица, д. 22',
    warehouseId: warehouse.id,
    phone: '+7 (843) 000-00-07',
    workingHours: 'Ежедневно, 10:00–23:00'
  },
  {
    id: 'pvz-8',
    name: 'Лесной',
    address: 'Екатеринбург, Лесной проспект, д. 30',
    warehouseId: warehouse.id,
    phone: '+7 (343) 000-00-08',
    workingHours: 'Ежедневно, 10:00–23:00'
  },
  {
    id: 'pvz-9',
    name: 'Гармония',
    address: 'Новосибирск, Красный проспект, д. 45',
    warehouseId: warehouse.id,
    phone: '+7 (383) 000-00-09',
    workingHours: 'Ежедневно, 09:00–22:00'
  },
  {
    id: 'pvz-10',
    name: 'Ленинский',
    address: 'Волгоград, проспект Ленина, д. 12',
    warehouseId: warehouse.id,
    phone: '+7 (844) 000-00-10',
    workingHours: 'Ежедневно, 09:00–23:00'
  }
];

/**
 * Бизнес-уровневые ПВЗ (единый реестр)
 * @type {import('./models').BusinessPickupPoint[]}
 */
const businessPickupPoints = [];

/**
 * Связи склад ↔ бизнес-ПВЗ (many-to-many)
 * @type {import('./models').WarehouseBusinessPickupPoint[]}
 */
/** @type {import('./models').WarehouseBusinessPickupPointLink[]} */
const warehouseBusinessLinks = [];

module.exports = { warehouse, warehouses, pickupPoints, businessPickupPoints, warehouseBusinessLinks };


