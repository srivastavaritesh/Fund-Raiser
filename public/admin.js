let site = null;

async function api(url, options={}) {
  const r = await fetch(url, options);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function check() {
  const m = await api("/api/admin/me");
  if (m.isAdmin) showPanel();
}
function showPanel() {
  document.getElementById("login").style.display = "none";
  document.getElementById("panel").style.display = "block";
  load();
}
async function login() {
  const status = document.getElementById("loginStatus");
  try {
    await api("/api/admin/login", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({password: document.getElementById("password").value})
    });
    showPanel();
  } catch(e) { status.textContent = e.message; }
}
async function load() {
  site = await api("/api/site");
  ["patientName","disease","hospital","hepatologist","oncologist","treatment","protocol","injections","tremelimumabCost","durvalumabCost","duration"].forEach(k => document.getElementById(k).value = site[k] || "");
  const b = site.bankDetails || {};
  ["accountName","accountNumber","ifsc","bankName","branch"].forEach(k => document.getElementById(k).value = b[k] || "");
  renderDocs();
}
async function saveDetails() {
  const body = {};
  ["patientName","disease","hospital","hepatologist","oncologist","treatment","protocol","injections","tremelimumabCost","durvalumabCost","duration"].forEach(k => body[k] = document.getElementById(k).value);
  await api("/api/admin/site",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  document.getElementById("saveStatus").textContent = "Saved.";
}
async function saveBank() {
  const bankDetails = {};
  ["accountName","accountNumber","ifsc","bankName","branch"].forEach(k => bankDetails[k] = document.getElementById(k).value);
  await api("/api/admin/site",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({bankDetails})});
  document.getElementById("bankStatus").textContent = "Saved.";
}
async function uploadQR() {
  const file = document.getElementById("qr").files[0];
  if (!file) return document.getElementById("qrStatus").textContent = "Choose an image first.";
  const fd = new FormData(); fd.append("qr", file);
  await api("/api/admin/qr",{method:"POST",body:fd});
  document.getElementById("qrStatus").textContent = "QR code updated.";
}
async function uploadDocument() {
  const file = document.getElementById("document").files[0];
  if (!file) return document.getElementById("docStatus").textContent = "Choose a file first.";
  const fd = new FormData(); fd.append("document", file);
  await api("/api/admin/documents",{method:"POST",body:fd});
  document.getElementById("docStatus").textContent = "Document added.";
  document.getElementById("document").value = "";
  load();
}
function renderDocs() {
  const el = document.getElementById("docList");
  el.innerHTML = (site.documents || []).map(x =>
    `<div style="padding:10px 0;border-bottom:1px solid var(--line)">
      <a href="${x.url}" target="_blank">${x.name}</a>
      <button class="secondary" style="float:right" onclick="removeDoc('${x.id}')">Remove</button>
    </div>`).join("") || `<p class="muted">No documents uploaded.</p>`;
}
async function removeDoc(id) {
  await api("/api/admin/documents/"+id,{method:"DELETE"});
  load();
}
async function logout() {
  await api("/api/admin/logout",{method:"POST"});
  location.reload();
}
check().catch(console.error);