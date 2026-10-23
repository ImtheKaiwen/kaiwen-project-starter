import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'

export interface SelectOption { value: string; label: string; description?: string }

interface Props { value: string; options: SelectOption[]; onChange(value: string): void; ariaLabel: string; compact?: boolean }

export function SelectControl({ value, options, onChange, ariaLabel, compact = false }: Props) {
  const [open, setOpen] = useState(false); const root = useRef<HTMLDivElement>(null)
  const selected = options.find((option) => option.value === value) ?? options[0]
  useEffect(() => {
    const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close)
  }, [])
  return <div className={`select-control ${compact ? 'is-compact' : ''}`} ref={root}>
    <button type="button" className="select-control__trigger" aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
      <span>{selected?.label ?? 'Seçin'}</span><Icon name="chevronDown" size={15} />
    </button>
    {open && <div className="select-control__menu" role="listbox">
      {options.map((option) => <button type="button" key={option.value} className={option.value === value ? 'is-selected' : ''} role="option" aria-selected={option.value === value} onClick={() => { onChange(option.value); setOpen(false) }}>
        <span className="select-control__check">{option.value === value && <Icon name="check" size={14} />}</span><span><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span>
      </button>)}
    </div>}
  </div>
}
