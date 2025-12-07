import type { ReactNode } from 'react';

type DropdownProps = {
  trigger: ReactNode;
  items: ReactNode;
};

export function Dropdown({ trigger, items }: DropdownProps) {
  return (
    <div className="relative">
      <details className="group">
        <summary className="list-none">{trigger}</summary>
        <div className="absolute right-0 z-30 mt-2 w-40 rounded-md border border-brand-primary bg-white text-sm shadow-lg">
          {items}
        </div>
      </details>
    </div>
  );
}
