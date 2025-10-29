import { type ClassValue, clsx } from 'clsx'
import { toast } from 'sonner'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function validateFields(
  fields: Record<string, any>,
  message = 'Preencha todos os campos obrigatórios'
): boolean {
  const hasEmpty = Object.values(fields).some(v => !v)
  if (hasEmpty) {
    toast.error(message)
  }
  return !hasEmpty
}
