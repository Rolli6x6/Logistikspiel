// window_contract.js
// Fenster für Aufträge und Verträge.

import { requestRoute } from "./routing.js";

export function attachContractWindow(modal) {
  const body = modal.querySelector(".modal-body");
  if (!body) return;

  body.innerHTML = `
    <div class="window-controls">
      <button id="cwActiveC" class="tab-controls cw-btn active">Aktive Aufträge</button>
      <button id="cwAvailableC" class="tab-controls cw-btn">Frachtbörse</button>
    </div>
    <div id="cwContent" class="window-content">
  `;

  const btnActiveC = body.querySelector("#cwActiveC");
  const btnAvailableC = body.querySelector("#cwAvailableC");
  const content = body.querySelector("#cwContent");

  function renderActiveContracts() {
    content.innerHTML = `
      <div id="ActiveContract-list"></div>
    `;

    const activeContractList = content.querySelector("#ActiveContract-list");

    renderActiveContractsList(activeContractList);
  };

  function renderAvailableContracts() {
    content.innerHTML = `
      <div id="AvailableContract-list"></div>
    `;

    const availableContractList = content.querySelector("#AvailableContract-list");

    renderAvailableContractsList(availableContractList);
  }

  btnActiveC.addEventListener("click", () => {
    modal.querySelectorAll(".cw-btn").forEach(btn => btn.classList.remove("active"));
    btnActiveC.classList.add("active");
    renderActiveContracts();
  });

  btnAvailableC.addEventListener("click", () => {
    modal.querySelectorAll(".cw-btn").forEach(btn => btn.classList.remove("active"));
    btnAvailableC.classList.add("active");
    renderAvailableContracts();
  });

  renderActiveContracts();
}

function renderActiveContractsList(container) {
  container.innerHTML = `
    Hier werden später die aktiven Aufträge angezeigt.
  `;
}

function renderAvailableContractsList(container) {
  container.innerHTML = `
    Hier werden später die verfügbaren Aufträge angezeigt.<br>
    <button id="refreshContracts" class="">Aufträge aktualisieren</button>
  `;
  document.getElementById("refreshContracts").addEventListener("click", () => {
    console.log("Aufträge werden aktualisiert...");
    requestRoute();
  });
}