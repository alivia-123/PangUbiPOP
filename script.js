const products = {
    pang: { name: "🥟 Mini Pangsit (Pang)", price: 12000, qty: 0 },
    ubi:  { name: "🍠 Ubi Brule (Ubi)", price: 12000, qty: 0 },
    pop:  { name: "🫧 Bundling Package (Pop)", price: 22000, qty: 0 }
};

let currentOrder = null;

function formatRupiah(angka) {
    return "Rp " + angka.toLocaleString("id-ID");
}

function updateQty(id, change) {
    if (products[id].qty + change >= 0) {
        products[id].qty += change;
        document.getElementById(`qty-${id}`).innerText = products[id].qty;
        updateStickyBar();
    }
}

function updateStickyBar() {
    let totalItems = 0;
    let totalPrice = 0;

    for (const key in products) {
        totalItems += products[key].qty;
        totalPrice += products[key].qty * products[key].price;
    }

    const stickyBar = document.getElementById("sticky-cart-bar");
    if (totalItems > 0) {
        stickyBar.style.display = "block";
        document.getElementById("sticky-total-items").innerText = `${totalItems} Pack dipilih`;
        document.getElementById("sticky-total-price").innerText = formatRupiah(totalPrice);
    } else {
        stickyBar.style.display = "none";
    }
}

function goToStep(step) {
    document.getElementById("page-menu").style.display = "none";
    document.getElementById("page-checkout").style.display = "none";
    document.getElementById("page-payment").style.display = "none";

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (step === 1) {
        document.getElementById("page-menu").style.display = "block";
    } else if (step === 2) {
        renderCheckoutSummary();
        document.getElementById("page-checkout").style.display = "block";
    } else if (step === 3) {
        document.getElementById("page-payment").style.display = "block";
    }
}

function renderCheckoutSummary() {
    const listContainer = document.getElementById("checkout-summary-list");
    let html = "";
    let total = 0;

    for (const key in products) {
        const item = products[key];
        if (item.qty > 0) {
            const subtotal = item.price * item.qty;
            total += subtotal;
            html += `
                <div class="summary-item">
                    <span>${item.name} <strong>(x${item.qty})</strong></span>
                    <span>${formatRupiah(subtotal)}</span>
                </div>
            `;
        }
    }

    listContainer.innerHTML = html;
    document.getElementById("checkout-total-price").innerText = formatRupiah(total);
}

document.getElementById("orderForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let itemsList = [];
    let total = 0;

    for (const key in products) {
        const item = products[key];
        if (item.qty > 0) {
            const subtotal = item.price * item.qty;
            total += subtotal;
            itemsList.push({ name: item.name, qty: item.qty, subtotal: subtotal });
        }
    }

    const notesInput = document.getElementById("notes").value.trim();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    
    currentOrder = {
        invoice: `POP-${randomNum}`,
        name: document.getElementById("name").value,
        whatsapp: document.getElementById("whatsapp").value,
        address: document.getElementById("address").value,
        notes: notesInput !== "" ? notesInput : "-",
        payment: document.getElementById("payment").value,
        items: itemsList,
        total: total,
        time: new Date().toLocaleString("id-ID")
    };

    setupPaymentPage(currentOrder);
    goToStep(3);
});

function setupPaymentPage(order) {
    document.getElementById("payment-process-box").style.display = "block";
    document.getElementById("receipt-box").style.display = "none";
    document.getElementById("invoice-id-badge").innerText = `#${order.invoice}`;
    document.getElementById("final-total-price").innerText = formatRupiah(order.total);

    const instructionBox = document.getElementById("payment-instruction");
    const confirmBtn = document.getElementById("btn-confirm-pay");

    if (order.payment === "QRIS GoPay") {
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = "0.6";
        confirmBtn.style.cursor = "not-allowed";
        
        let countdown = 10;
        confirmBtn.innerText = `Harap Scan QR (${countdown}s) ⏳`;

        const timerInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                confirmBtn.innerText = `Harap Scan QR (${countdown}s) ⏳`;
            } else {
                clearInterval(timerInterval);
                confirmBtn.disabled = false;
                confirmBtn.style.opacity = "1";
                confirmBtn.style.cursor = "pointer";
                confirmBtn.innerText = "Saya Sudah Bayar ✅";
            }
        }, 1000);

        instructionBox.innerHTML = `
            <div class="qris-box" style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                <p style="margin-bottom: 12px;">Scan QR Code di bawah ini menggunakan aplikasi <strong>GoPay, Gojek, atau QRIS Bank Lainnya</strong>:</p>
                
                <div style="background: white; padding: 10px; display: inline-block; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 12px;">
                    <img src="qris-gopay.png" alt="QRIS GoPay" style="width: 200px; height: 200px; object-fit: contain; display: block;" onerror="this.onerror=null; this.src='https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://gopay.co.id';">
                </div>

                <div>
                    <a href="qris-gopay.png" download="QRIS-PangUbiPop.png" class="btn-download-qr" style="display: inline-block; background: #0284c7; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">📥 Unduh Gambar QR</a>
                </div>
                
                <small style="color:#64748b; display:block; margin-top:10px;">Pastikan nominal transfer sesuai dengan total tagihan.</small>
            </div>
        `;
    } else {
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = "1";
        confirmBtn.style.cursor = "pointer";
        confirmBtn.innerText = "Konfirmasi Pesanan COD ✅";

        instructionBox.innerHTML = `
            <p>💵 <strong>Pembayaran Tunai (COD)</strong></p>
            <p style="margin-top:8px;">Siapkan uang pas sebesar <strong>${formatRupiah(order.total)}</strong> saat pesanan diantar ke tempat Anda.</p>
        `;
    }
}

function confirmPayment() {
    const history = JSON.parse(localStorage.getItem("pangubipop_orders") || "[]");
    history.push(currentOrder);
    localStorage.setItem("pangubipop_orders", JSON.stringify(history));

    let itemsString = currentOrder.items.map(i => `${i.name} (x${i.qty})`).join(", ");

    // Ganti URL di bawah jika menggunakan Google Sheets database
    const scriptURL = 'https://script.google.com/macros/s/AKfycbztxrPoLf6kkBcEpyyae_yljmo8TtL9CUksItBsXtAizIXX3S5PLHvzuq4vlY5cr_rTCg/exec'; 
    
    const payload = {
        invoice: currentOrder.invoice,
        time: currentOrder.time,
        name: currentOrder.name,
        whatsapp: currentOrder.whatsapp,
        address: currentOrder.address,
        notes: currentOrder.notes,
        payment: currentOrder.payment,
        items: itemsString,
        total: formatRupiah(currentOrder.total)
    };

    fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(error => console.error('Error!', error.message));

    document.getElementById("payment-process-box").style.display = "none";
    document.getElementById("receipt-box").style.display = "block";

    let itemsHtml = currentOrder.items.map(i => `<div>• ${i.name} (x${i.qty}) - ${formatRupiah(i.subtotal)}</div>`).join("");

    // Nomor WhatsApp Penjual (menggunakan nomor Anda)
    const sellerWhatsApp = "628299702438"; 
    const waText = encodeURIComponent(
        `Halo Kak, saya sudah memesan di PangUbiPop!\n\n` +
        `No. Pesanan: #${currentOrder.invoice}\n` +
        `Nama: ${currentOrder.name}\n` +
        `Jadwal: ${currentOrder.address}\n` +
        `Catatan: ${currentOrder.notes}\n` +
        `Metode: ${currentOrder.payment}\n` +
        `Total: ${formatRupiah(currentOrder.total)}\n\n` +
        `Berikut bukti pesanan saya.`
    );
    const waLink = `https://wa.me/${sellerWhatsApp}?text=${waText}`;

    document.getElementById("receipt-content").innerHTML = `
        <strong>No. Pesanan:</strong> #${currentOrder.invoice}<br>
        <strong>Waktu:</strong> ${currentOrder.time}<br>
        <strong>Nama:</strong> ${currentOrder.name}<br>
        <strong>Jadwal:</strong> ${currentOrder.address}<br>
        <strong>Catatan:</strong> ${currentOrder.notes}<br>
        <strong>Metode:</strong> ${currentOrder.payment} (<span style="color:#16a34a;font-weight:bold;">LUNAS / DIPROSES</span>)
        <hr style="margin:8px 0; border:none; border-top:1px dashed #cbd5e1;">
        ${itemsHtml}
        <hr style="margin:8px 0; border:none; border-top:1px dashed #cbd5e1;">
        <strong>Total Dibayar: ${formatRupiah(currentOrder.total)}</strong>
        
        <div style="margin-top: 20px; text-align: center;">
            <a href="${waLink}" target="_blank" style="display: block; background: #22c55e; color: white; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
                💬 Konfirmasi Pesanan ke WhatsApp Penjual
            </a>
        </div>
    `;
}

function resetAll() {
    document.getElementById("orderForm").reset();
    for (const key in products) {
        products[key].qty = 0;
        document.getElementById(`qty-${key}`).innerText = "0";
    }
    updateStickyBar();
    goToStep(1);
}