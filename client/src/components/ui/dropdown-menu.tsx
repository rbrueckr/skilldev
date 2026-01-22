import * as React from 'react';
import { cn } from '../../lib/utils';

interface DropdownMenuProps {
  children: React.ReactNode;
  modal?: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children, modal = true }) => (
  <div className='relative'>{children}</div>
);

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
  onClick?: () => void;
}

const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
  children,
  asChild = false,
  className,
  onClick,
}) => (
  <div className={cn('cursor-pointer', className)} onClick={onClick}>
    {children}
  </div>
);

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'end' | 'center';
  sideOffset?: number;
}

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  className,
  align = 'center',
  sideOffset = 0,
}) => (
  <div
    className={cn(
      'absolute z-50 min-w-[8rem] rounded-md border border-border bg-white p-1 shadow-md',
      {
        'left-0': align === 'start',
        'right-0': align === 'end',
        'left-1/2 -translate-x-1/2': align === 'center',
      },
      className,
    )}
    style={{ marginTop: sideOffset }}>
    {children}
  </div>
);

interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
  onClick?: () => void;
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  className,
  asChild = false,
  onClick,
}) => (
  <div
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-muted focus:bg-accent focus:text-accent-foreground',
      className,
    )}
    onClick={onClick}>
    {children}
  </div>
);

const DropdownMenuSeparator: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => <div className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
};
