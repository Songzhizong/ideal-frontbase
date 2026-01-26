import { handlers } from "@/mocks/handlers";
import { setupWorker } from "msw/browser";

export const worker = setupWorker(...handlers);

export async function enableMocking() {
  if (!import.meta.env.DEV) {
    return;
  }

  await worker.start({
    onUnhandledRequest: "bypass",
  });
}
