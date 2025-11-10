import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type Align = 'start' | 'end';

interface DropdownContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  align: Align;
  triggerRef: React.RefObject<HTMLElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

const DropdownCtx = createContext<DropdownContextValue | null>(null);

interface RootProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: Align;
}

export const DropdownMenu: React.FC<RootProps> = ({
  children,
  open,
  defaultOpen,
  onOpenChange,
  align = 'end',
}) => {
  const [internalOpen, setInternalOpen] = useState<boolean>(!!defaultOpen);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isControlled = typeof open === 'boolean';
  const isOpen = isControlled ? (open as boolean) : internalOpen;
  const setOpen = useCallback(
    (v: boolean) => {
      if (!isControlled) setInternalOpen(v);
      onOpenChange?.(v);
    },
    [isControlled, onOpenChange]
  );

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        contentRef.current?.contains(t) ||
        triggerRef.current?.contains(t)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, setOpen]);

  const value = useMemo<DropdownContextValue>(
    () => ({ open: isOpen, setOpen, align, triggerRef, contentRef }),
    [isOpen, setOpen, align]
  );

  return (
    <DropdownCtx.Provider value={value}>
      <div className="dropdown-root">{children}</div>
    </DropdownCtx.Provider>
  );
};

function useDropdownCtx(caller: string) {
  const ctx = useContext(DropdownCtx);
  if (!ctx) {
    throw new Error(`${caller} must be used within <DropdownMenu>`);
  }
  return ctx;
}

interface TriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children: React.ReactNode;
  toggleOnClick?: boolean;
}

export const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  ({ asChild, children, onClick, toggleOnClick = true, ...rest }, forwardedRef) => {
    const { open, setOpen, triggerRef } = useDropdownCtx('DropdownMenuTrigger');
    const refCallback = (node: HTMLButtonElement | null) => {
      if (node) (triggerRef as React.MutableRefObject<HTMLElement>).current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
    };

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        ref: refCallback,
        onClick: (e: React.MouseEvent) => {
          (children as any).props?.onClick?.(e);
          onClick?.(e);
          if (toggleOnClick) setOpen(!open);
        },
        'aria-haspopup': 'menu',
        'aria-expanded': open,
      });
    }

    return (
      <button
        type="button"
        className="dropdown-trigger"
        ref={refCallback}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          onClick?.(e);
          if (toggleOnClick) setOpen(!open);
        }}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

interface ContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: Align;
  className?: string;
  matchTriggerWidth?: boolean;
}

export const DropdownMenuContent: React.FC<ContentProps> = ({
  align,
  className,
  children,
  matchTriggerWidth,
  ...rest
}) => {
  const { open, align: ctxAlign, triggerRef, contentRef } = useDropdownCtx('DropdownMenuContent');
  const actualAlign = align ?? ctxAlign;

  // Basic keyboard navigation
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      contentRef.current?.querySelectorAll<HTMLButtonElement>('[data-menu-item]:not([aria-disabled="true"])') ?? []
    );
    if (!items.length) return;
    const activeIndex = items.findIndex((el) => el === document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = items[(activeIndex + 1 + items.length) % items.length];
      next?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = items[(activeIndex - 1 + items.length) % items.length];
      prev?.focus();
    }
  };

  // Positioning: place under trigger
  const style: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    ...(actualAlign === 'end' ? { right: 0 } : { left: 0 }),
    visibility: open ? 'visible' : 'hidden',
    pointerEvents: open ? 'auto' : 'none',
    ...(matchTriggerWidth && triggerRef.current
      ? { width: (triggerRef.current as HTMLElement).offsetWidth }
      : {}),
  };

  return (
    <div
      role="menu"
      aria-hidden={!open}
      ref={contentRef}
      className={`dropdown-content ${className ?? ''}`}
      style={style}
      onKeyDown={onKeyDown}
      {...rest}
    >
      {children}
    </div>
  );
};

interface ItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  inset?: boolean;
  disabled?: boolean;
  closeOnSelect?: boolean;
}

export const DropdownMenuItem = React.forwardRef<HTMLButtonElement, ItemProps>(
  ({ children, onClick, disabled, inset, className, closeOnSelect = true, ...rest }, ref) => {
    const { setOpen } = useDropdownCtx('DropdownMenuItem');
    return (
      <button
        type="button"
        ref={ref}
        role="menuitem"
        data-menu-item
        aria-disabled={disabled ? 'true' : undefined}
        className={`dropdown-item ${inset ? 'dropdown-item--inset' : ''} ${className ?? ''}`}
        disabled={disabled}
        onClick={(e) => {
          if (disabled) return;
          onClick?.(e);
          if (closeOnSelect) setOpen(false);
        }}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

export const DropdownMenuLabel: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <div className={`dropdown-label ${className ?? ''}`} {...rest}>
      {children}
    </div>
  );
};

export const DropdownMenuSeparator: React.FC = () => {
  return <div role="separator" className="dropdown-separator" />;
};

export const DropdownMenuGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="dropdown-group">{children}</div>;
};

// Root exports for API parity
export const DropdownMenuPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;
export const DropdownMenuSub = DropdownMenuGroup;
export const DropdownMenuSubContent = DropdownMenuContent;
export const DropdownMenuSubTrigger = DropdownMenuItem;
export const DropdownMenuShortcut: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="dropdown-shortcut">{children}</span>
);


