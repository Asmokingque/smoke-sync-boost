/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as orderReceipt } from './order-receipt.tsx'
import { template as adminOrderNotification } from './admin-order-notification.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'order-receipt': orderReceipt,
  'admin-order-notification': adminOrderNotification,
}
