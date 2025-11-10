import React from 'react';

interface ChipProps {
  label: string;
  desc?: string;
  selected?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export const Chip: React.FC<ChipProps> = ({ label, desc, selected = false, disabled = false, icon, onClick }) => {
  const className = `chip${selected ? ' chip--selected' : ''}${disabled ? ' chip--disabled' : ''}`;
  return (
    <button className={className} type="button" disabled={disabled} onClick={onClick}>
      {icon ? <span className="chip__icon" aria-hidden="true">{icon}</span> : null}
      <span className="chip__label">{label}</span>
      {desc ? (
        <>
          <span className="chip__dot">·</span>
          <span className="chip__desc">{desc}</span>
        </>
      ) : null}
    </button>
  );
};


