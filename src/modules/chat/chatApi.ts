import { z } from "zod";

import { apiClient } from "@/lib/api/client";
import type {
  ChatMessage,
  ChatMessagePage,
  ChatThreadWithMeta,
} from "@/types/chat.types";

const PAGE_SIZE = 30;

const messageTypeSchema = z.enum(["text", "system"]);

const messageSchema = z.object({
  id: z.string(),
  thread_id: z.string(),
  sender_id: z.string(),
  content: z.string(),
  message_type: messageTypeSchema,
  status: z.enum(["sent", "read"]),
  deleted_at: z.string().nullable(),
  edited_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
}).strict();

const threadSchema = z.object({
  id: z.string(),
  status: z.enum(["active", "archived", "closed"]),
  updated_at: z.string(),
  volunteer_profile_id: z.string(),
  shelter_profile_id: z.string(),
  vacancy_title: z.string(),
  vacancy_slug: z.string().nullable(),
  other_participant_name: z.string(),
  last_message: z.object({
    content: z.string(),
    sender_id: z.string(),
    created_at: z.string(),
    message_type: messageTypeSchema,
  }).strict().nullable(),
  unread_count: z.number(),
}).strict();

const threadsSchema = z.object({ threads: z.array(threadSchema) }).strict();
const unreadSchema = z.object({ count: z.number() }).strict();
const pageSchema = z.object({
  messages: z.array(messageSchema),
  has_more: z.boolean(),
  next_cursor: z.string().nullable(),
}).strict();
const messageEnvelopeSchema = z.object({
  message: messageSchema,
  success: z.literal(true),
}).strict();
const readSchema = z.object({
  success: z.literal(true),
  unread_count: z.number(),
}).strict();
const withVolunteerSchema = z.object({ thread_id: z.string().nullable() }).strict();
const byVacancySchema = z.object({
  threads: z.record(z.string(), z.string()),
}).strict();

export const chatMessageSchema = messageSchema;

function parse<T>(schema: z.ZodType<T>, value: unknown, operation: string): T {
  const result = schema.safeParse(value);
  if (!result.success) throw new TypeError(`Resposta inválida ao ${operation}.`);
  return result.data;
}

function threadPath(threadId: string): string {
  return `/chat/threads/${encodeURIComponent(threadId)}`;
}

function jsonBody(method: "POST" | "PATCH", body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export async function listThreads(signal?: AbortSignal): Promise<ChatThreadWithMeta[]> {
  return parse(threadsSchema, await apiClient<unknown>("/chat/threads", { signal }), "carregar conversas").threads;
}

export async function getUnreadCount(signal?: AbortSignal): Promise<number> {
  return parse(unreadSchema, await apiClient<unknown>("/chat/unread-count", { signal }), "contar mensagens").count;
}

export async function listMessages(
  threadId: string,
  cursor?: string | null,
  signal?: AbortSignal,
): Promise<ChatMessagePage> {
  const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (cursor) params.set("cursor", cursor);
  return parse(
    pageSchema,
    await apiClient<unknown>(`${threadPath(threadId)}/messages?${params}`, { signal }),
    "carregar mensagens",
  );
}

export async function sendMessage(threadId: string, content: string): Promise<ChatMessage> {
  return parse(
    messageEnvelopeSchema,
    await apiClient<unknown>(`${threadPath(threadId)}/messages`, jsonBody("POST", { content })),
    "enviar mensagem",
  ).message;
}

export async function editMessage(threadId: string, messageId: string, content: string): Promise<ChatMessage> {
  return parse(
    messageEnvelopeSchema,
    await apiClient<unknown>(
      `${threadPath(threadId)}/messages/${encodeURIComponent(messageId)}`,
      jsonBody("PATCH", { content }),
    ),
    "editar mensagem",
  ).message;
}

export async function markThreadRead(threadId: string): Promise<number> {
  return parse(
    readSchema,
    await apiClient<unknown>(`${threadPath(threadId)}/read`, { method: "POST" }),
    "marcar como lida",
  ).unread_count;
}

export function parseThreadWithVolunteer(value: unknown): string | null {
  return parse(withVolunteerSchema, value, "carregar conversa com voluntário").thread_id;
}

export function parseThreadsByVacancy(value: unknown): Record<string, string> {
  return parse(byVacancySchema, value, "carregar conversas por vaga").threads;
}

export async function getThreadsByVacancy(signal?: AbortSignal): Promise<Record<string, string>> {
  return parseThreadsByVacancy(await apiClient<unknown>("/chat/threads/by-vacancy", { signal }));
}
