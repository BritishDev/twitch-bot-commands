(() => {
  let theme;
  try { theme = localStorage.getItem("command-guide-theme"); } catch { /* Storage can be disabled. */ }
  if (theme !== "light" && theme !== "dark") theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
})();
