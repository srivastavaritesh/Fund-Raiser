async function loadSite() {
  const r = await fetch("/api/site");
  const d = await r.json();

  const ids = ["patientName","disease","hospital","hepatologist","oncologist","treatment","protocol","injections","duration","tremelimumabCost","durvalumabCost"];
  ids.forEach(id => document.getElementById(id).textContent = d[id] || "");

  const qr = document.getElementById("qrWrap");
  qr.innerHTML = d.qrImage ? `<img src="${d.qrImage}" alt="Donation QR code">` : "<span>QR code will be added by the admin.</span>";

  const bank = document.getElementById("bankDetails");
  const b = d.bankDetails || {};
  const fields = [
    ["Account Name", b.accountName], ["Account Number", b.accountNumber],
    ["IFSC", b.ifsc], ["Bank", b.bankName], ["Branch", b.branch]
  ];
  bank.innerHTML = fields.map(([k,v]) => `<div class="bank-detail"><small>${k}</small><strong>${v || "To be added by admin"}</strong></div>`).join("");

  const docs = document.getElementById("documentsList");
  docs.innerHTML = d.documents?.length
    ? d.documents.map(x => `<div class="doc"><span>${x.name}</span><a href="${x.url}" target="_blank" rel="noopener">View</a></div>`).join("")
    : `<p class="muted">No documents have been added yet.</p>`;
}
loadSite().catch(console.error);