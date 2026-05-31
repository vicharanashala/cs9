import { type ReactNode } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { X } from 'lucide-react'

interface ModalProps {
  children?: ReactNode
  isOpen: boolean
  onClose: () => void
  panelClassName?: string
  title?: string
  /** 'center' (default) or 'top-right' for dropdown-style panels */
  position?: 'center' | 'top-right'
}

function Modal({
  children,
  isOpen,
  onClose,
  panelClassName = '',
  title = 'Dialog',
  position = 'center',
}: ModalProps) {
  if (!isOpen) {
    return null
  }

  if (position === 'top-right') {
    return (
      <div
        aria-label={title}
        aria-modal="true"
        className="fixed right-6 top-20 z-[1000] w-full max-w-sm rounded-xl border border-border bg-card pt-10 pb-6 px-6 shadow-2xl text-foreground transition-all duration-250 animate-in fade-in-50 slide-in-from-top-4"
        role="dialog"
      >
        <button
          aria-label="Close dialog"
          className="absolute right-4 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
        </button>
        {children}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onClose={onClose} aria-label={title} className="relative z-[1000]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in" aria-hidden="true" />

      {/* Centered panel */}
      <div className="fixed inset-0 flex items-center justify-center px-4">
        <DialogPanel
          className={`relative w-full max-w-[440px] rounded-xl border border-border bg-card p-8 shadow-2xl sm:p-12 text-foreground transition-all duration-300 transform scale-100 animate-in fade-in-50 zoom-in-95 ${panelClassName}`}
        >
          <button
            aria-label="Close dialog"
            className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-secondary hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
          </button>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export default Modal
