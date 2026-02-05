import * as SelectPrimitive from '@radix-ui/react-select'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label: string
  value: string | number
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
}

export default function Select({ label, value, onChange, options, placeholder = 'Select...' }: SelectProps) {
  const selectedOption = options.find((opt) => opt.value === String(value))

  return (
    <div className="flex flex-col gap-2 text-xs font-medium text-muted2">
      <span>{label}</span>
      <SelectPrimitive.Root value={String(value)} onValueChange={onChange}>
        <SelectPrimitive.Trigger className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-ink/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-muted2/80 focus:border-accent/60 focus:ring-4 focus:ring-accent/20">
          <SelectPrimitive.Value placeholder={placeholder}>
            {selectedOption?.label ?? placeholder}
          </SelectPrimitive.Value>
          <SelectPrimitive.Icon>
            <ChevronIcon />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-white/10 bg-surfaceStrong shadow-xl"
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="max-h-60 overflow-y-auto p-1">
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm text-white outline-none transition data-[highlighted]:bg-white/10 data-[state=checked]:text-accent2"
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  )
}

function ChevronIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className="text-muted2"
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
