import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react'
import { ChevronDown, Check } from 'lucide-react'

/**
 * Styled dropdown/select component (Headless UI Listbox).
 *
 * Props:
 *   options  — Array<{ value: string, label: string }>
 *   value    — currently selected value (string)
 *   onChange — (value: string) => void
 *   placeholder — string (default: 'Select an option')
 *   className — optional extra classes for the wrapper
 */
function Select({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select an option',
  className = '',
}) {
  const selected = options.find(o => o.value === value)

  return (
    <Listbox value={value} onChange={onChange}>
      <div className={`relative ${className}`}>
        {/* Trigger */}
        <ListboxButton
          className={({ open }) =>
            `flex h-11 w-full items-center justify-between rounded-lg border bg-card px-4 text-sm text-foreground transition focus:outline-none hover:border-primary/50 ${
              open
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
            } ${selected ? 'text-foreground' : 'text-muted-foreground'}`
          }
        >
          {({ open }) => (
            <>
              <span>{selected ? selected.label : placeholder}</span>
              <ChevronDown
                className={`h-4.5 w-4.5 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180 text-primary' : ''}`}
                strokeWidth={1.8}
              />
            </>
          )}
        </ListboxButton>

        {/* Dropdown */}
        <ListboxOptions className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-border bg-popover py-1 shadow-xl focus:outline-none animate-in fade-in slide-in-from-top-2 duration-150">
          {options.map(opt => (
            <ListboxOption
              key={opt.value}
              value={opt.value}
              className={({ selected: isSel }) =>
                `flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition ${
                  isSel
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-foreground hover:bg-secondary'
                }`
              }
            >
              {({ selected: isSel }) => (
                <>
                  {opt.label}
                  {isSel && <Check className="h-4 w-4 text-primary" strokeWidth={2} />}
                </>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  )
}

export default Select
