import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, Copy, Check } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
  duration?: number
}

export function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-teal" />,
  }

  const backgrounds = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-cream border-teal/30',
  }

  return (
    <div
      className={`fixed top-4 right-4 z-[100] max-w-md transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${backgrounds[type]} border-2 rounded-xl p-4 shadow-lg flex items-start gap-3`}>
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-1">
          <p className="text-brown whitespace-pre-line">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className="flex-shrink-0 text-brown-light hover:text-brown transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

// Toast container for multiple toasts
interface ToastItem {
  id: string
  message: string
  type: ToastType
}

interface ToastContainerProps {
  toasts: ToastItem[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ transform: `translateY(${index * 8}px)` }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}

// Hook for easy toast management
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const ToastWrapper = () => (
    toasts.length > 0 ? <ToastContainer toasts={toasts} onRemove={removeToast} /> : null
  )

  return { showToast, ToastWrapper }
}

// Confirmation Modal Component
interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'warning' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  onConfirm, 
  onCancel 
}: ConfirmModalProps) {
  if (!isOpen) return null

  const typeStyles = {
    warning: {
      icon: <AlertCircle className="w-12 h-12 text-amber-500" />,
      confirmBtn: 'bg-amber-500 hover:bg-amber-600',
    },
    danger: {
      icon: <AlertCircle className="w-12 h-12 text-red-500" />,
      confirmBtn: 'bg-red-500 hover:bg-red-600',
    },
  }

  const styles = typeStyles[type]

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {styles.icon}
          </div>
          <h3 className="font-serif text-xl font-bold text-brown mb-2">
            {title}
          </h3>
          <p className="text-brown-light mb-6">
            {message}
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-cream-dark text-brown font-medium hover:bg-cream transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 rounded-xl text-white font-medium transition-colors ${styles.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// QR Code Modal Component
interface QRModalProps {
  isOpen: boolean
  url: string
  title: string
  onClose: () => void
}

export function QRModal({ isOpen, url, title, onClose }: QRModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-brown-light hover:text-brown transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <h3 className="font-serif text-xl font-bold text-brown mb-2">
            Share Proof
          </h3>
          <p className="text-brown-light text-sm mb-4">
            {title}
          </p>
          
          {/* QR Code */}
          <div className="bg-white p-4 rounded-xl inline-block mb-4 border-2 border-cream-dark">
            <QRCodeSVG 
              value={url} 
              size={200}
              level="M"
              includeMargin={false}
              bgColor="#FFFFFF"
              fgColor="#4A3728"
            />
          </div>
          
          {/* URL with copy */}
          <div className="bg-cream rounded-xl p-3 flex items-center gap-2">
            <p className="text-xs text-brown-light truncate flex-1 text-left font-mono">
              {url}
            </p>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 p-2 rounded-lg hover:bg-cream-dark transition-colors"
              title="Copy link"
            >
              {copied ? (
                <Check className="w-4 h-4 text-teal" />
              ) : (
                <Copy className="w-4 h-4 text-brown-light" />
              )}
            </button>
          </div>
          
          <p className="text-xs text-brown-light mt-4">
            Scan to verify this proof
          </p>
        </div>
      </div>
    </div>
  )
}
