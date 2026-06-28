(function () {
  const status = document.getElementById("offlineStatus");

  function updateConnectionStatus() {
    if (!status) return;
    const offline = navigator.onLine === false;
    status.hidden = !offline;
    status.textContent = offline ? "Офлайн" : "";
  }

  window.addEventListener("online", updateConnectionStatus);
  window.addEventListener("offline", updateConnectionStatus);
  updateConnectionStatus();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {
        // The guided flow remains usable online if private mode or browser policy blocks SW.
      });
    });
  }
})();
