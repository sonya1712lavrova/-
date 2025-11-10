# ПВЗ Демо Проект

Демо-сайт для управления складом и точками самовывоза (ПВЗ).

## Структура проекта

- `/src` — Backend (Node.js)
- `/frontend` — Frontend (React + TypeScript + Vite)

## Запуск проекта

### Backend

```bash
# В корне проекта
node src/server.js
```

Backend запустится на http://localhost:3000

### Frontend

```bash
# В папке frontend
cd frontend
npm install
npm run dev
```

Frontend запустится на http://localhost:5173

## API Endpoints

- `GET /warehouse` — Получить информацию о складе
- `GET /pickup-points` — Получить список всех ПВЗ
- `GET /pickup-points/:id` — Получить конкретный ПВЗ

## Структура данных

### Warehouse (Склад)
- `id` — уникальный идентификатор
- `name` — название склада
- `address` — адрес склада

### PickupPoint (ПВЗ)
- `id` — уникальный идентификатор
- `name` — название точки
- `address` — адрес точки
- `warehouseId` — ID склада, к которому привязана точка
- `phone` — телефон (опционально)
- `workingHours` — график работы (опционально)

