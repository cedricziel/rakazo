import type { IpcMainInvokeEvent, WebContents } from "electron";
import { describe, expect, it, vi } from "vitest";
import { createClipboardHandler } from "./clipboard.js";

function setup() {
  const frame = { url: "https://app.example.com/app/bot" };
  const contents = { mainFrame: frame, isDestroyed: () => false } as unknown as WebContents;
  const event = { sender: contents, senderFrame: frame } as IpcMainInvokeEvent;
  const target = { webContents: contents, url: "https://app.example.com" };
  const writeText = vi.fn();
  return { event, writeText, handle: createClipboardHandler(() => target, writeText) };
}

describe("desktop clipboard handler", () => {
  it("writes text from the app page", () => {
    const { event, handle, writeText } = setup();
    expect(handle(event, "copied")).toBe(true);
    expect(writeText).toHaveBeenCalledWith("copied");
  });

  it("rejects subframes, other windows and other origins", () => {
    const { event, handle, writeText } = setup();
    const screen = { url: "https://app.example.com/novnc/embed.html" };
    expect(handle({ ...event, senderFrame: screen } as IpcMainInvokeEvent, "x")).toBe(false);
    expect(handle({ ...event, sender: {} as WebContents }, "x")).toBe(false);
    const other = { url: "https://other.example.com/" };
    const otherContents = { ...event.sender, mainFrame: other } as unknown as WebContents;
    expect(handle({ sender: otherContents, senderFrame: other } as IpcMainInvokeEvent, "x")).toBe(
      false,
    );
    expect(writeText).not.toHaveBeenCalled();
  });

  it.each([undefined, null, 3, {}, "x".repeat(1024 * 1024 + 1)])("rejects %s", (text) => {
    const { event, handle, writeText } = setup();
    expect(handle(event, text)).toBe(false);
    expect(writeText).not.toHaveBeenCalled();
  });
});
