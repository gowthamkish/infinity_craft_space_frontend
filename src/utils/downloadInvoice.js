import api from "../api/axios";

/** Orders that can have a Bill of Supply (mirrors the backend rule). */
export const canDownloadInvoice = (order) =>
  !!order &&
  order.status !== "cancelled" &&
  (order.paymentMethod === "cod" || order.paymentStatus === "completed" || order.paymentStatus === "refunded");

/** Fetches the PDF through the shared axios instance (auth + CSRF) and saves it. Throws a readable Error on failure. */
export async function downloadInvoice(orderId) {
  try {
    const res = await api.get(`/api/orders/${orderId}/invoice`, { responseType: "blob" });
    const disposition = res.headers?.["content-disposition"] || "";
    const name = /filename="?([^";]+)"?/i.exec(disposition)?.[1] || `bill-of-supply-${orderId}.pdf`;
    const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch (err) {
    // blob error bodies are Blobs — decode the JSON message when present
    let msg = "Could not download the invoice. Please try again.";
    try {
      const body = err.response?.data instanceof Blob ? JSON.parse(await err.response.data.text()) : err.response?.data;
      msg = body?.message || body?.error || msg;
    } catch { /* keep default */ }
    throw new Error(msg);
  }
}
