import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Button as HuiButton } from '@headlessui/react'
import { twMerge } from 'tailwind-merge'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  className?: string
  type?: 'button' | 'submit' | 'reset'
  children?: ReactNode
}

function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-bold rounded-lg transition-all duration-250 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.96]'
  const variants: Record<ButtonVariant, string> = {
    primary:
      'min-h-11 bg-primary text-primary-foreground shadow-md hover:bg-primary/95 hover:shadow-lg focus-visible:ring-offset-background px-6 text-sm uppercase tracking-wider',
    secondary:
      'min-h-9 border border-border bg-card text-foreground shadow-sm hover:bg-secondary hover:text-secondary-foreground hover:border-primary/30 focus-visible:ring-offset-background px-5 text-sm',
    ghost:
      'min-h-9 text-muted-foreground hover:bg-secondary hover:text-foreground px-4 text-sm',
  }

  return (
    <HuiButton type={type} className={twMerge(base, variants[variant], className)} {...props}>
      {children}
    </HuiButton>
  )
}

export default Button
