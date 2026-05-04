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

interface OrderReceiptProps {
  orderNumber?: string
  customerName?: string
  status?: string
  orderType?: string
  deliveryAddress?: string
  items?: OrderItem[]
  subtotal?: number | string
  tax?: number | string
  deliveryFee?: number | string
  tip?: number | string
  total?: number | string
}

const fmt = (v: number | string | undefined) => Number(v ?? 0).toFixed(2)

const OrderReceiptEmail = ({
  orderNumber, customerName, status = 'confirmed', orderType = 'Pickup',
  deliveryAddress, items = [], subtotal, tax, deliveryFee, tip, total,
}: OrderReceiptProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Anderson's Smoking Que order is confirmed</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={brand}>Anderson's Smoking Que</Heading>
        <Hr style={goldRule} />
        <Heading style={h1}>
          {customerName ? `Thank you, ${customerName}!` : 'Thank you for your order!'}
        </Heading>
        <Text style={text}>
          Your order <strong>{orderNumber ?? ''}</strong> is <strong>{status}</strong>.
        </Text>

        <Section style={card}>
          {items.map((i, idx) => (
            <Text key={idx} style={lineItem}>
              {i.quantity} × {i.item_name}
              <span style={amount}>${fmt(i.line_total)}</span>
            </Text>
          ))}
          <Hr style={rule} />
          <Text style={lineItem}>Subtotal<span style={amount}>${fmt(subtotal)}</span></Text>
          <Text style={lineItem}>Tax<span style={amount}>${fmt(tax)}</span></Text>
          {Number(deliveryFee) > 0 && (
            <Text style={lineItem}>Delivery<span style={amount}>${fmt(deliveryFee)}</span></Text>
          )}
          {Number(tip) > 0 && (
            <Text style={lineItem}>Tip<span style={amount}>${fmt(tip)}</span></Text>
          )}
          <Hr style={rule} />
          <Text style={totalLine}>Total<span style={amount}>${fmt(total)}</span></Text>
        </Section>

        <Text style={text}>
          {orderType === 'Delivery' && deliveryAddress
            ? `Delivery to: ${deliveryAddress}`
            : 'Pickup order — we\'ll have it ready for you.'}
        </Text>
        <Text style={footer}>Questions? Reply to this email or call us.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: OrderReceiptEmail,
  subject: (d: Record<string, any>) =>
    `Order confirmed — ${d.orderNumber ?? ''}`.trim(),
  displayName: 'Order receipt',
  previewData: {
    orderNumber: 'ASQ-1042',
    customerName: 'Jane',
    status: 'confirmed',
    orderType: 'Pickup',
    items: [
      { quantity: 1, item_name: 'Brisket Plate', line_total: 24.99 },
      { quantity: 2, item_name: 'Pulled Pork Sandwich', line_total: 23.98 },
    ],
    subtotal: 48.97, tax: 4.04, deliveryFee: 0, tip: 5, total: 58.01,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif', color: '#1a1a1a' }
const container = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const brand = { fontFamily: 'Georgia, serif', color: '#C8A24A', fontSize: '22px', margin: '0' }
const goldRule = { borderColor: '#C8A24A', borderTopWidth: '1px', margin: '8px 0 24px' }
const h1 = { fontSize: '22px', fontWeight: 'bold', margin: '0 0 12px' }
const text = { fontSize: '14px', lineHeight: '1.5', margin: '0 0 16px' }
const card = { backgroundColor: '#fafafa', padding: '16px 20px', borderRadius: '6px', margin: '16px 0' }
const lineItem = { fontSize: '14px', margin: '4px 0', display: 'block' as const }
const totalLine = { fontSize: '15px', fontWeight: 'bold', margin: '8px 0', display: 'block' as const }
const amount = { float: 'right' as const }
const rule = { borderColor: '#e5e5e5', margin: '12px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0' }
