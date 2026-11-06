import { setupWorker } from "msw/browser";
import { socketHandlers } from "./socket";
import { handlers } from "./handlers";
import { initialize } from "./database";

export async function startMocks() {
  await initialize();
  const worker = setupWorker(...handlers, ...socketHandlers);
  await worker.start({ onUnhandledRequest: "bypass" });
  return worker;
}
