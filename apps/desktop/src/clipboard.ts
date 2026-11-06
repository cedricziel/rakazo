import type { IpcMainInvokeEvent } from "electron";
import type { AppTarget } from "./app-frame.js";
import { fromAppFrame } from "./app-frame.js";

const MAX_CLIPBOARD_TEXT = 1024 * 1024;

/** Write-only, so a framed screen can copy out without being able to read the clipboard. */
export function createClipboardHandler(
  getTarget: () => AppTarget | null,
  writeText: (text: string) => void,
) {
  return (event: Pick<IpcMainInvokeEvent, "sender" | "senderFrame">, text: unknown): boolean => {
    if (!fromAppFrame(getTarget(), event)) return false;
    if (typeof text !== "string" || text.length > MAX_CLIPBOARD_TEXT) return false;
    writeText(text);
    return true;
  };
}
