import React from 'react';
import { MenuItem } from './MenuItem';
import { Account } from './Account';
import { SearchField } from './SearchField';

export const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-right-side">
        <div className="logo" aria-label="Логотип" />
        <nav className="nav">
          <MenuItem label="Товары" />
          <MenuItem label="Цены" />
          <MenuItem label="Остатки" active />
          <MenuItem label="Поставки" />
          <MenuItem label="Заказы" />
          <MenuItem label="Финансы" />
          <MenuItem label="Аналитика" />
          <MenuItem label="Продвижение" />
          <MenuItem label="Витрина" />
        </nav>
        <SearchField />
      </div>
      <div className="header-left-side">
        <button className="icon-button" aria-label="Чат">
          <img src="/icons/i24_chat.svg" alt="" width={24} height={24} />
        </button>
        <button className="icon-button" aria-label="Уведомления">
          <img src="/icons/i24_bell.svg" alt="" width={24} height={24} />
        </button>
        <Account variant="avatar" photoSrc="/icons/nav_account.jpg" />
      </div>
    </header>
  );
};

