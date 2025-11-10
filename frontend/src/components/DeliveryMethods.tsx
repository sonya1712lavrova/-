import React, { useState } from 'react';

interface DeliveryMethod {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface AvailableMethod {
  id: string;
  name: string;
  description: string;
}

interface DeliveryMethodsProps {
  pickupPointsCount: number;
  onViewPickupPoints: () => void;
  isPending?: boolean; // склад ожидает подключения
}

export const DeliveryMethods: React.FC<DeliveryMethodsProps> = ({ pickupPointsCount, onViewPickupPoints, isPending = false }) => {
  const getPointsText = (count: number) => {
    if (count === 1) return '1 точку самовывоза';
    if (count >= 2 && count <= 4) return `${count} точки самовывоза`;
    return `${count} точек самовывоза`;
  };

  const [activeMethods, setActiveMethods] = useState<DeliveryMethod[]>(
    isPending
      ? []
      : [
          {
            id: 'dbs-self',
            name: 'DBS · Самовывоз',
            description: `Доставляем в ${getPointsText(pickupPointsCount)}`,
            isActive: true
          }
        ]
  );

  // Пересобираем список активных способов при смене статуса склада/количества ПВЗ
  React.useEffect(() => {
    if (isPending) {
      setActiveMethods([]);
    } else {
      setActiveMethods([
        {
          id: 'dbs-self',
          name: 'DBS · Самовывоз',
          description: `Доставляем в ${getPointsText(pickupPointsCount)}`,
          isActive: true
        }
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, pickupPointsCount]);

  const availableMethods: AvailableMethod[] = [
    {
      id: 'fbs',
      name: 'FBS',
      description: 'Собираете заказы и отвозите их на ПВЗ или на склад Маркета, а мы доставляем'
    },
    {
      id: 'fbs-express',
      name: 'FBS · Express',
      description: 'Собираете заказа за 10–60 минут, мы их забираем и доставляем в течение 2 часов'
    },
    {
      id: 'dbs-yandex',
      name: 'DBS · Яндекс Доставка',
      description: 'Самостоятельно передаёте собранные заказы — удобно для покупателей по всей России'
    },
    {
      id: 'dbs-business',
      name: 'DBS · Деловые линии',
      description: 'Самостоятельно передаёте собранные заказы — подойдёт для быстрой доставки по городу'
    },
    {
      id: 'dbs-sdek',
      name: 'DBS · СДЭК',
      description: 'Самостоятельно передаёте собранные заказы — выгодно для крупногабаритных отправлений'
    },
    {
      id: 'dbs-courier',
      name: 'DBS · Ваши курьеры',
      description: 'Собираете заказы и доставляете их вашей курьерской службой'
    }
  ];

  // Если склад ожидает подключения — самовывоз доступен к подключению
  const availableMethodsWithSelf: AvailableMethod[] = isPending
    ? [
        {
          id: 'dbs-self',
          name: 'DBS · Самовывоз',
          description: `Доставляем в ${getPointsText(pickupPointsCount)}`
        },
        ...availableMethods
      ]
    : availableMethods;

  const toggleMethod = (id: string) => {
    setActiveMethods(prev =>
      prev.map(method =>
        method.id === id ? { ...method, isActive: !method.isActive } : method
      )
    );
  };

  return (
    <>
      {/* Active Methods Section */}
      {!isPending && (<div className="section">
        <div className="card-header">
          <h2 className="section-title">Подключённые способы</h2>
        </div>
        <table className="table table-connected">
          <thead>
            <tr>
              <th className="col-name">Способ доставки</th>
              <th className="col-settings">Настройки</th>
              <th className="col-active">Активен</th>
              <th className="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            {activeMethods.map(method => (
              <tr 
                key={method.id}
                onClick={(e) => {
                  // Prevent click if clicking on toggle or button
                  const target = e.target as HTMLElement;
                  if (target.closest('.toggle') || target.closest('.more-button')) {
                    return;
                  }
                  if (method.id === 'dbs-self') {
                    onViewPickupPoints();
                  }
                }}
              >
                <td className="col-name">
                  <div className="method-name">{method.name}</div>
                </td>
                <td className="col-settings">
                  <div className="method-description">{method.description}</div>
                </td>
                <td className="col-active">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={method.isActive}
                      onChange={() => toggleMethod(method.id)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </td>
                <td className="col-actions">
                  <button className="more-button" aria-label="Ещё">
                    <img src="/icons/i16_moreVertical.svg" alt="" width={16} height={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>)}

      {/* Available Methods Section */}
      <div className="section">
        <div className="card-header">
          <h2 className="section-title">Можно подключить</h2>
          <button className="compare-button" type="button">
            <img src="/icons/i16_compare.svg" alt="" width={16} height={16} />
            Сравнить способы доставки
          </button>
        </div>
        <table className="table table-available">
          <thead>
            <tr>
              <th className="col-name">Способ доставки</th>
              <th className="col-description">Описание</th>
              <th className="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            {(isPending ? availableMethodsWithSelf : availableMethods).map(method => (
              <tr key={method.id}>
                <td className="col-name">
                  <div className="method-name">{method.name}</div>
                </td>
                <td className="col-description">
                  <div className="method-description">{method.description}</div>
                </td>
                <td className="col-actions" style={{ textAlign: 'right' }}>
                  <button className="btn-secondary btn-secondary--sm">Подключить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* FBY Card from Figma spec */}
      <div className="fby-card">
        <div className="fby-card__icon">
          <img src="/images/fby_card_icon.svg" alt="" width={72} height={72} />
        </div>
        <div className="fby-card__row">
          <div className="fby-card__textblock">
            <div className="fby-card__title">Работайте по FBY — вся логистика будет на нас</div>
            <div className="fby-card__subtitle">
              Вы привозите товары на склад Маркета, а мы обрабатываем, собираем и доставляем заказы
            </div>
          </div>
          <div className="fby-card__meta">
            <div className="fby-card__percent">от 29,5%</div>
            <button className="btn-primary btn-primary--sm">Подробнее</button>
          </div>
        </div>
      </div>
    </>
  );
};

