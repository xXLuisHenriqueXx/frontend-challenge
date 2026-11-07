import { setupWorker } from "msw/browser";
import { initialize } from "./database";
import { handlers } from "./handlers";
import { socketHandlers } from "./socket";

export async function startMocks() {
  await initialize();
  const worker = setupWorker(...handlers, ...socketHandlers);
  await worker.start({
    onUnhandledRequest: "bypass",
    quiet: import.meta.env.PROD,
  });
  return worker;
}
