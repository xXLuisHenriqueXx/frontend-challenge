import "./styles.css";

async function bootstrap() {
  if (typeof window === "undefined") return;
  const app = import("./app");
  if (import.meta.env.VITE_MOCKS !== "false") {
    const { startMocks } = await import("./mocks/browser");
    await startMocks();
  }
  (await app).mountApp();
}
void bootstrap().catch((error) => {
  document.getElementById("app")!.textContent =
    "Falha ao iniciar: " + String(error);
});
