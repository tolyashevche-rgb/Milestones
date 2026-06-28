(function () {
  const offlineStatus = document.getElementById("offlineStatus");
  let deferredInstallPrompt = null;
  let installedThisSession = false;
  let swRegistration = null;
  let reloadingForUpdate = false;
  let updateRequested = false;

  function updateConnectionStatus() {
    if (!offlineStatus) return;
    const offline = navigator.onLine === false;
    offlineStatus.hidden = !offline;
    offlineStatus.textContent = offline ? "Офлайн" : "";
  }

  function isStandalone() {
    return installedThisSession
      || (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches)
      || navigator.standalone === true;
  }

  function syncInstallUi() {
    const button = document.getElementById("installApp");
    const help = document.getElementById("installHelp");
    const standalone = isStandalone();
    if (button) button.hidden = standalone || !deferredInstallPrompt;
    if (help) {
      help.hidden = standalone;
      help.textContent = deferredInstallPrompt
        ? "Milestones можна додати на головний екран і відкривати одним дотиком."
        : "Щоб відкривати Milestones одним дотиком, у меню браузера оберіть «Додати на головний екран».";
    }
  }

  function syncUpdateUi() {
    const controls = document.getElementById("updateControls");
    const updateReady = Boolean(swRegistration && swRegistration.waiting
      && navigator.serviceWorker && navigator.serviceWorker.controller);
    if (controls) controls.hidden = !updateReady;
  }

  function monitorRegistration(registration) {
    swRegistration = registration;
    syncUpdateUi();
    if (!registration || !registration.addEventListener) return;
    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      if (!worker || !worker.addEventListener) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed") syncUpdateUi();
      });
    });
  }

  window.addEventListener("online", updateConnectionStatus);
  window.addEventListener("offline", updateConnectionStatus);
  updateConnectionStatus();

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    syncInstallUi();
  });

  window.addEventListener("appinstalled", () => {
    installedThisSession = true;
    deferredInstallPrompt = null;
    const status = document.getElementById("installStatus");
    if (status) status.textContent = "Milestones додано на головний екран.";
    syncInstallUi();
  });

  document.addEventListener("click", async (event) => {
    const updateButton = event.target.closest && event.target.closest("#applyUpdate");
    if (updateButton) {
      const status = document.getElementById("updateStatus");
      if (!swRegistration || !swRegistration.waiting) {
        if (status) status.textContent = "Оновлення ще не готове. Спробуйте пізніше.";
        return;
      }
      updateButton.disabled = true;
      updateRequested = true;
      if (status) status.textContent = "Оновлюємо…";
      swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
      return;
    }

    const button = event.target.closest && event.target.closest("#installApp");
    if (!button || !deferredInstallPrompt) return;
    button.disabled = true;
    const status = document.getElementById("installStatus");
    try {
      await deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (status) status.textContent = choice && choice.outcome === "accepted"
        ? "Підтверджуємо встановлення…"
        : "Можна встановити пізніше через меню браузера.";
    } catch {
      if (status) status.textContent = "Не вдалося відкрити встановлення. Спробуйте через меню браузера.";
    } finally {
      deferredInstallPrompt = null;
      button.disabled = false;
      syncInstallUi();
    }
  });

  const screen = document.getElementById("screen");
  if (screen && "MutationObserver" in window) {
    new MutationObserver(() => { syncInstallUi(); syncUpdateUi(); }).observe(screen, { childList: true });
  }
  syncInstallUi();
  syncUpdateUi();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!updateRequested || reloadingForUpdate) return;
      reloadingForUpdate = true;
      window.location.reload();
    });
    window.addEventListener("load", async () => {
      try {
        monitorRegistration(await navigator.serviceWorker.register("./sw.js"));
      } catch {
        // The guided flow remains usable online if private mode or browser policy blocks SW.
      }
    });
  }
})();
