'use strict';

/**
 * @typedef {Object} Warehouse
 * @property {string} id
 * @property {string} name
 * @property {string} address
 */

/**
 * @typedef {Object} PickupPoint
 * @property {string} id
 * @property {string} name
 * @property {string} address
 * @property {string} warehouseId
 * @property {string=} phone
 * @property {string=} workingHours
 */

/**
 * Бизнес-уровневые ПВЗ (общий реестр для аккаунта)
 * @typedef {Object} BusinessPickupPoint
 * @property {string} id
 * @property {string} name
 * @property {string} address
 * @property {string} identifier
 * @property {string} phone
 * @property {string=} extension
 * @property {string} directions_comment
 * @property {BusinessPickupScheduleInterval[]} schedule
 * @property {number} max_weight
 * @property {number} max_length
 * @property {number} storage_period
 */

/**
 * Интервал работы
 * @typedef {Object} BusinessPickupScheduleInterval
 * @property {Array<'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun'>} selected_days
 * @property {string} work_from  // HH:MM
 * @property {string} work_to    // HH:MM
 */

/**
 * Связь склад ↔ бизнес-ПВЗ c метаданными доставки
 * @typedef {Object} WarehouseBusinessPickupPointLink
 * @property {string} warehouseId
 * @property {string} businessPickupPointId
 * @property {boolean} enabled
 * @property {number=} delivery_time
 * @property {number=} delivery_cost_mgt
 * @property {number=} delivery_cost_kgt
 */

module.exports = {};


