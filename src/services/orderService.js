function getVendorNumber() {
  return String(import.meta.env.VITE_VENDOR_WHATSAPP_NUMBER || "")
    .replace(/\D/g, "")
    .trim();
}

function getWebhookUrl() {
  return String(import.meta.env.VITE_ORDER_WEBHOOK_URL || "").trim();
}

export function createOrderId() {
  const datePart = new Date()
    .toISOString()
    .slice(0, 19)
    .replace(/[-:T]/g, "");

  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();

  return `JUK-${datePart}-${randomPart}`;
}

export function buildOrderMessage(order) {
  const itemLines = order.items
    .map((item, index) => {
      return `${index + 1}. ${item.quantity} x ${item.name} [${
        item.source
      }] - N$${Number(item.lineTotal || 0).toFixed(2)}`;
    })
    .join("\n");

  return [
    `New Jukskei Order`,
    ``,
    `Order ID: ${order.orderId}`,
    `Name: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Email: ${order.customerEmail}`,
    ``,
    `Items:`,
    itemLines,
    ``,
    `Total: N$${Number(order.total || 0).toFixed(2)}`,
  ].join("\n");
}

export async function sendOrderToGoogleSheet(order) {
  const webhookUrl = getWebhookUrl();

  if (!webhookUrl) {
    console.warn("Missing VITE_ORDER_WEBHOOK_URL. Order not sent to sheet.");
    return;
  }

  await fetch(webhookUrl, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(order),
  });
}

export function openWhatsAppOrder(order) {
  const vendorNumber = getVendorNumber();

  if (!vendorNumber) {
    throw new Error("Missing VITE_VENDOR_WHATSAPP_NUMBER in your .env file.");
  }

  const message = order.whatsappMessage || buildOrderMessage(order);

  const url = `https://wa.me/${vendorNumber}?text=${encodeURIComponent(
    message
  )}`;

  window.open(url, "_blank", "noopener,noreferrer");
}

export function buildOrderPayload({ customer, items, total }) {
  const orderId = createOrderId();

  const normalisedItems = items.map((item) => ({
    id: item.id,
    source: item.source,
    name: item.name,
    category: item.category || "",
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 0),
    lineTotal: Number(item.price || 0) * Number(item.quantity || 0),
  }));

  const order = {
    orderId,
    createdAt: new Date().toISOString(),
    customerName: customer.name.trim(),
    customerPhone: customer.phone.trim(),
    customerEmail: customer.email.trim(),
    items: normalisedItems,
    total: Number(total || 0),
  };

  return {
    ...order,
    whatsappMessage: buildOrderMessage(order),
  };
}