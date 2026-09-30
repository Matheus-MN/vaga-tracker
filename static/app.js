const STATUS_META = [
  { key: "enviado", label: "Enviado", color: "var(--c-enviado)" },
  { key: "em_processo", label: "Em processo", color: "var(--c-em_processo)" },
  { key: "entrevista", label: "Entrevista", color: "var(--c-entrevista)" },
  { key: "aprovado", label: "Aprovado", color: "var(--c-aprovado)" },
  { key: "rejeitado", label: "Rejeitado", color: "var(--c-rejeitado)" },
];

const board = document.getElementById("board");
const statsEl = document.getElementById("stats");
const modal = document.getElementById("modal-form");
const form = document.getElementById("form-candidatura");
const btnExcluir = document.getElementById("btn-excluir");

let candidaturas = [];

function fmtDate(d) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}`;
}

function buildBoard() {
  board.innerHTML = "";
  STATUS_META.forEach((meta) => {
    const col = document.createElement("div");
    col.className = "column";
    col.dataset.status = meta.key;

    const items = candidaturas.filter((c) => c.status === meta.key);

    col.innerHTML = `
      <div class="column-head">
        <span class="column-dot" style="background:${meta.color}"></span>
        <h2>${meta.label}</h2>
        <span class="column-count">${items.length}</span>
      </div>
      <div class="column-body" data-status="${meta.key}"></div>
    `;

    const body = col.querySelector(".column-body");

    if (items.length === 0) {
      body.innerHTML = `<div class="column-empty">sem candidaturas</div>`;
    } else {
      items.forEach((c) => body.appendChild(renderCard(c)));
    }

    body.addEventListener("dragover", (e) => {
      e.preventDefault();
      body.classList.add("drag-over");
    });
    body.addEventListener("dragleave", () => body.classList.remove("drag-over"));
    body.addEventListener("drop", async (e) => {
      e.preventDefault();
      body.classList.remove("drag-over");
      const id = e.dataTransfer.getData("text/plain");
      await updateCandidatura(id, { status: meta.key });
      await refresh();
    });

    board.appendChild(col);
  });
}

function renderCard(c) {
  const tpl = document.getElementById("card-template");
  const node = tpl.content.cloneNode(true);
  const card = node.querySelector(".card");

  card.dataset.id = c.id;
  node.querySelector(".card-empresa").textContent = c.empresa;
  node.querySelector(".card-modalidade").textContent = c.modalidade || "—";
  node.querySelector(".card-cargo").textContent = c.cargo;
  node.querySelector(".card-local").textContent = c.localizacao || "";
  node.querySelector(".card-prazo").textContent = c.prazo ? `até ${fmtDate(c.prazo)}` : "";

  card.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", c.id);
  });
  card.addEventListener("click", () => openForm(c));

  return node;
}

function buildStats(counts) {
  const order = ["total", "enviado", "em_processo", "entrevista", "aprovado", "rejeitado"];
  const labels = {
    total: "Total",
    enviado: "Enviadas",
    em_processo: "Em processo",
    entrevista: "Entrevista",
    aprovado: "Aprovadas",
    rejeitado: "Rejeitadas",
  };
  statsEl.innerHTML = order
    .map((k) => `<div class="stat"><div class="n">${counts[k] ?? 0}</div><div class="l">${labels[k]}</div></div>`)
    .join("");
}

async function fetchCandidaturas() {
  const res = await fetch("/api/candidaturas");
  candidaturas = await res.json();
}

async function fetchStats() {
  const res = await fetch("/api/stats");
  const counts = await res.json();
  buildStats(counts);
}

async function refresh() {
  await Promise.all([fetchCandidaturas(), fetchStats()]);
  buildBoard();
}

function openForm(candidatura = null) {
  form.reset();
  document.getElementById("form-title").textContent = candidatura ? "Editar candidatura" : "Nova candidatura";
  document.getElementById("f-id").value = candidatura?.id ?? "";
  document.getElementById("f-empresa").value = candidatura?.empresa ?? "";
  document.getElementById("f-cargo").value = candidatura?.cargo ?? "";
  document.getElementById("f-status").value = candidatura?.status ?? "enviado";
  document.getElementById("f-modalidade").value = candidatura?.modalidade ?? "Presencial";
  document.getElementById("f-localizacao").value = candidatura?.localizacao ?? "";
  document.getElementById("f-prazo").value = candidatura?.prazo ?? "";
  document.getElementById("f-link").value = candidatura?.link ?? "";
  document.getElementById("f-notas").value = candidatura?.notas ?? "";
  btnExcluir.hidden = !candidatura;
  modal.showModal();
}

async function createCandidatura(payload) {
  await fetch("/api/candidaturas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function updateCandidatura(id, payload) {
  await fetch(`/api/candidaturas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function deleteCandidatura(id) {
  await fetch(`/api/candidaturas/${id}`, { method: "DELETE" });
}

document.getElementById("btn-nova").addEventListener("click", () => openForm());
document.getElementById("btn-cancelar").addEventListener("click", () => modal.close());

form.addEventListener("submit", async () => {
  const id = document.getElementById("f-id").value;
  const payload = {
    empresa: document.getElementById("f-empresa").value.trim(),
    cargo: document.getElementById("f-cargo").value.trim(),
    status: document.getElementById("f-status").value,
    modalidade: document.getElementById("f-modalidade").value,
    localizacao: document.getElementById("f-localizacao").value.trim() || null,
    prazo: document.getElementById("f-prazo").value || null,
    link: document.getElementById("f-link").value.trim() || null,
    notas: document.getElementById("f-notas").value.trim() || null,
  };

  if (id) {
    await updateCandidatura(id, payload);
  } else {
    await createCandidatura(payload);
  }
  await refresh();
});

btnExcluir.addEventListener("click", async () => {
  const id = document.getElementById("f-id").value;
  if (id && confirm("Excluir esta candidatura?")) {
    await deleteCandidatura(id);
    modal.close();
    await refresh();
  }
});

refresh();
