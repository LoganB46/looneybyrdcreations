// cart.js

// ✅ IMPORTANT: your Apache DocumentRoot is the API folder,
// so the endpoint is http://localhost/create-checkout-session.php
const CHECKOUT_ENDPOINT = "http://localhost/create-checkout-session.php";

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function setCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function money(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function computeSubtotal(cart) {
  return cart.reduce((sum, item) => {
    const qty = item.quantity ?? 1;
    const unit = item.unitPrice ?? 0; // cents
    return sum + unit * qty;
  }, 0);
}

function updateTotals(subtotalCents) {
  const shippingCents = 0; // later
  const totalCents = subtotalCents + shippingCents;

  document.getElementById("subtotal").textContent = money(subtotalCents);
  document.getElementById("shipping").textContent = money(shippingCents);
  document.getElementById("total").textContent = money(totalCents);
}

function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cartItems");
  container.innerHTML = "";

  if (!cart.length) {
    container.innerHTML =
      '<p class="text-muted text-center">Your cart is empty</p>';
    updateTotals(0);
    return;
  }

  cart.forEach((item, idx) => {
    const qty = item.quantity ?? 1;
    const unit = item.unitPrice ?? 0;
    const lineTotal = unit * qty;

    const optionsText = item.options
      ? Object.entries(item.options)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")
      : "";

    const row = document.createElement("div");
    row.className =
      "d-flex justify-content-between align-items-center border-bottom py-3 gap-3 flex-wrap";

    row.innerHTML = `
      <div class="flex-grow-1">
        <div class="fw-bold">${item.name ?? "Item"}</div>
        ${optionsText ? `<div class="text-muted small">${optionsText}</div>` : ""}
        <div class="text-muted small">Unit: ${money(unit)}</div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-sm btn-outline-secondary" data-action="dec" data-idx="${idx}">−</button>

        <input
          class="form-control form-control-sm text-center"
          style="width:70px"
          data-action="set"
          data-idx="${idx}"
          value="${qty}"
          inputmode="numeric"
          aria-label="Quantity"
        />

        <button class="btn btn-sm btn-outline-secondary" data-action="inc" data-idx="${idx}">+</button>

        <div class="ms-2 fw-semibold" style="min-width:90px; text-align:right;">
          ${money(lineTotal)}
        </div>

        <button class="btn btn-sm btn-outline-danger ms-2" data-action="remove" data-idx="${idx}" title="Remove">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `;

    container.appendChild(row);
  });

  updateTotals(computeSubtotal(cart));
}

// Button clicks: +, −, remove
document.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const action = btn.dataset.action;
  const idx = Number(btn.dataset.idx);

  const cart = getCart();
  const item = cart[idx];
  if (!item) return;

  item.quantity = item.quantity ?? 1;

  if (action === "inc") item.quantity += 1;
  if (action === "dec") item.quantity = Math.max(1, item.quantity - 1);
  if (action === "remove") cart.splice(idx, 1);

  setCart(cart);
  renderCart();
});

// Manual quantity edit
document.addEventListener("input", (e) => {
  const input = e.target.closest('input[data-action="set"]');
  if (!input) return;

  const idx = Number(input.dataset.idx);
  const cart = getCart();
  const item = cart[idx];
  if (!item) return;

  const val = parseInt(input.value, 10);
  item.quantity = Number.isFinite(val) && val > 0 ? val : 1;

  setCart(cart);
  updateTotals(computeSubtotal(cart)); // lightweight update without full re-render
});

// Stripe redirect helper
async function goToCheckout(cartItems) {
  const res = await fetch(CHECKOUT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: cartItems.map((i) => ({
        price: i.priceId,
        quantity: i.quantity ?? 1,
      })),
      success_url: "http://127.0.0.1:5500/success.html",
      cancel_url: "http://127.0.0.1:5500/shop/cart.html",
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Checkout failed");

  // ✅ Use same-tab navigation (avoids popup blockers)
  window.location.href = data.url;
}

window.checkout = async function checkout() {
  const cart = getCart();
  if (!cart.length) {
    alert("Your cart is empty.");
    return;
  }

  try {
    await goToCheckout(cart);
  } catch (err) {
    console.error(err);
    alert(err.message || "Checkout failed.");
  }

  const bad = cart.find(
    (i) => !i.priceId || !String(i.priceId).startsWith("price_"),
  );
  if (bad) {
    alert(
      `Checkout error: item "${bad.name}" has an invalid Stripe priceId (${bad.priceId}).`,
    );
    return;
  }
};

document.addEventListener("DOMContentLoaded", renderCart);
