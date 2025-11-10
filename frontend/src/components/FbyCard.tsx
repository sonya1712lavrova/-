import React from 'react';

export const FbyCard: React.FC = () => {
  return (
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
  );
};


