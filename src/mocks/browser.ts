import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
import { initialize } from "./database";

export async function startMocks() {
  await initialize();
  const worker = setupWorker(...handlers);
  await worker.start({ onUnhandledRequest: "bypass" });
  return worker;
}
