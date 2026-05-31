import type { InputHTMLAttributes } from 'react'
import { Input as HuiInput } from '@headlessui/react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

function Input({ className = '', ...props }: InputProps) {
  return (
    <HuiInput
      className={`h-11 w-full rounded-lg border border-border hover:border-primary/50 bg-card px-4 text-sm text-foreground shadow-sm outline-none transition duration-200 placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  )
}

export default Input
