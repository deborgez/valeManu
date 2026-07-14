const THEME_INIT_SCRIPT = `
(function () {
  try {
    var isPublicPage = location.pathname.startsWith("/orcamento") || location.pathname.startsWith("/login");
    if (isPublicPage) {
      document.documentElement.classList.remove("dark");
      return;
    }
    var stored = localStorage.getItem("theme");
    var isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  } catch (e) {}
})();
`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
