import { afterEach, describe, expect, it, vi } from "vitest";
import { streamImage } from "./streamImage";

afterEach(() => vi.unstubAllGlobals());

describe("image gateway recovery", () => {
  it("surfaces credit errors without retrying", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "Add AI credits to continue." }), { status: 402 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(streamImage("/images", { prompt: "Brisket" }, vi.fn())).rejects.toThrow("Add AI credits to continue.");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("never replays a provider denial delivered in the stream", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('event: error\ndata: {"error":{"message":"Provider access denied."}}\n\n'));
    vi.stubGlobal("fetch", fetchMock);
    await expect(streamImage("/images", { prompt: "Brisket" }, vi.fn())).rejects.toThrow("Provider access denied.");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("replays only a zero-event stream, preserving size and prompt", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(""))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ b64_json: "Zm9v" }] })));
    vi.stubGlobal("fetch", fetchMock);
    const frame = vi.fn();
    await streamImage("/images", { prompt: "Brisket", size: "portrait" }, frame);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ prompt: "Brisket", size: "portrait", stream: false });
    expect(frame).toHaveBeenCalledWith("data:image/png;base64,Zm9v", true);
  });
});