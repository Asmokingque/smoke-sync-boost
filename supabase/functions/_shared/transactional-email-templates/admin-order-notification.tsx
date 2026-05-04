import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface OrderItem {
  quantity: number
  item_name: string
  line_total: number | string
}

interface AdminOrderProps {
  orderNumber?: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  orderType?: string
  deliveryAddress?: string
  items?: OrderItem[]
  total?: number | string
}

const fmt = (v: number | string | undefined) => Number(v ?? 0).toFixed(2)

const AdminOrderEmail = ({
  orderNumber, customerName, customerPhone, customerEmail,
  orderType = 'Pickup', deliveryAddress, items = [], total,
}: AdminOrderProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New paid order — {orderNumber}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={brand}>New Paid Order</Heading>
        <Hr style={goldRule} />
        <Text style={text}>
          Order <strong>{orderNumber ?? ''}</strong> — <strong>${fmt(total)}</strong>
        </Text>
        <Text style={text}>
          <strong>{customerName}</strong><br />
          {customerPhone}<br />
          {customerEmail}
        </Text>
        <Text style={text}>
          <strong>{orderType}</strong>{deliveryAddress ? ` — ${deliveryAddress}` : ''}
        </Text>
        <Section style={card}>
          {items.map((i, idx) => (
            <Text key={idx} style={lineItem}>
              {i.quantity} × {i.item_name}
              <span style={amount}>${fmt(i.line_total)}</span>
            </Text>
          ))}
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminOrderEmail,
  subject: (d: Record<string, any>) =>
    `New paid order ${d.orderNumber ?? ''} — ${d.customerName ?? ''}`.trim(),
  displayName: 'Admin order notification',
  previewData: {
    orderNumber: 'ASQ-1042',
    customerName: 'Jane Doe',
    customerPhone: '555-123-4567',
    customerEmail: 'jane@example.com',
    orderType: 'Delivery',
    deliveryAddress: '123 Main St',
    items: [{ quantity: 1, item_name: 'Brisket Plate', line_total: 24.99 }],
    total: 35.5,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif', color: '#1a1a1a' }
const container = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const brand = { fontFamily: 'Georgia, serif', color: '#C8A24A', fontSize: '22px', margin: '0' }
const goldRule = { borderColor: '#C8A24A', borderTopWidth: '1px', margin: '8px 0 24px' }
const text = { fontSize: '14px', lineHeight: '1.5', margin: '0 0 16px' }
const card = { backgroundColor: '#fafafa', padding: '16px 20px', borderRadius: '6px', margin: '16px 0' }
const lineItem = { fontSize: '14px', margin: '4px 0', display: 'block' as const }
const amount = { float: 'right' as const }
