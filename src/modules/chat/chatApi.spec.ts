import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ apiClient: vi.fn() }));
vi.mock("@/lib/api/client", () => ({ apiClient: mocks.apiClient }));

import {
  editMessage,
  getThreadsByVacancy,
  getUnreadCount,
  listMessages,
  listThreads,
  markThreadRead,
  sendMessage,
} from "./chatApi";

const message = {
  id: "m1",
  thread_id: "t1",
  sender_id: "u1",
  content: "oi <3",
  message_type: "text",
  status: "sent",
  deleted_at: null,
  edited_at: null,
  created_at: "2026-11-02T10:00:00.000Z",
  updated_at: "2026-11-02T10:00:00.000Z",
};

const thread = {
  id: "t1",
  status: "active",
  updated_at: "2026-11-02T10:00:00.000Z",
  volunteer_profile_id: "u1",
  shelter_profile_id: "u2",
  vacancy_title: "Cuidador",
  vacancy_slug: null,
  other_participant_name: "Abrigo Feliz",
  last_message: {
    content: "oi",
    sender_id: "u2",
    created_at: "2026-11-02T10:00:00.000Z",
    message_type: "system",
  },
  unread_count: 2,
};

beforeEach(() => vi.clearAllMocks());

describe("chat API client", () => {
  it("lists threads and rejects unexpected fields", async () => {
    mocks.apiClient.mockResolvedValueOnce({ threads: [thread] });
    await expect(listThreads()).resolves.toEqual([thread]);
    expect(mocks.apiClient).toHaveBeenCalledWith("/chat/threads", { signal: undefined });

    mocks.apiClient.mockResolvedValueOnce({ threads: [{ ...thread, extra: 1 }] });
    await expect(listThreads()).rejects.toThrow("Resposta inválida");
  });

  it("reads the unread badge count", async () => {
    mocks.apiClient.mockResolvedValueOnce({ count: 4 });
    await expect(getUnreadCount()).resolves.toBe(4);
    expect(mocks.apiClient).toHaveBeenCalledWith("/chat/unread-count", { signal: undefined });
  });

  it("pages messages with an encoded cursor", async () => {
    const page = { messages: [message], has_more: true, next_cursor: "2026|m1" };
    mocks.apiClient.mockResolvedValueOnce(page);
    await expect(listMessages("t1", "2026-11-02T10:00:00.000Z|m1")).resolves.toEqual(page);
    expect(mocks.apiClient).toHaveBeenCalledWith(
      "/chat/threads/t1/messages?limit=30&cursor=2026-11-02T10%3A00%3A00.000Z%7Cm1",
      { signal: undefined },
    );
  });

  it("sends and edits messages as JSON", async () => {
    mocks.apiClient.mockResolvedValueOnce({ message, success: true });
    await expect(sendMessage("t1", "oi <3")).resolves.toEqual(message);
    expect(mocks.apiClient).toHaveBeenCalledWith("/chat/threads/t1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "oi <3" }),
    });

    const edited = { ...message, content: "editada", edited_at: "2026-11-02T10:01:00.000Z" };
    mocks.apiClient.mockResolvedValueOnce({ message: edited, success: true });
    await expect(editMessage("t1", "m1", "editada")).resolves.toEqual(edited);
    expect(mocks.apiClient).toHaveBeenCalledWith("/chat/threads/t1/messages/m1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "editada" }),
    });
  });

  it("marks a thread as read and returns the new total", async () => {
    mocks.apiClient.mockResolvedValueOnce({ success: true, unread_count: 0 });
    await expect(markThreadRead("t1")).resolves.toBe(0);
    expect(mocks.apiClient).toHaveBeenCalledWith("/chat/threads/t1/read", { method: "POST" });
  });

  it("maps vacancies to the volunteer's threads", async () => {
    mocks.apiClient.mockResolvedValueOnce({ threads: { v1: "t1" } });
    await expect(getThreadsByVacancy()).resolves.toEqual({ v1: "t1" });
  });
});
