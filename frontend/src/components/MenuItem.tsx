import React from 'react';

interface MenuItemProps {
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({ label, href = '#', active = false, onClick }) => {
  const className = `menu-item${active ? ' active' : ''}`;
  return (
    <a href={href} className={className} onClick={onClick}>
      {label}
    </a>
  );
};


