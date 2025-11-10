import React from 'react';

interface AccountProps {
  name?: string;
  role?: string;
  photoSrc?: string; // if provided -> Photo=True
  variant?: 'rich' | 'avatar';
}

export const Account: React.FC<AccountProps> = ({ name, role, photoSrc, variant = 'avatar' }) => {
  if (variant === 'rich') {
    return (
      <button className="account-rich" type="button" aria-label="Аккаунт">
        <div className="account-text">
          <div className="account-name">{name}</div>
          <div className="account-role">{role}</div>
        </div>
        <div className="account-avatar">
          {photoSrc ? (
            <img src={photoSrc} alt="avatar" width={40} height={40} />
          ) : (
            <img src="/icons/nav_account.svg" alt="avatar" width={40} height={40} />
          )}
        </div>
      </button>
    );
  }
  return (
    <button className="account-avatar-only" type="button" aria-label="Аккаунт">
      <div className="account-avatar">
        {photoSrc ? (
          <img src={photoSrc} alt="avatar" width={40} height={40} />
        ) : (
          <img src="/icons/nav_account.svg" alt="avatar" width={40} height={40} />
        )}
      </div>
    </button>
  );
};


