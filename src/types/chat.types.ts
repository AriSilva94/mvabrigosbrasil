export type ChatThreadStatus = "active" | "archived" | "closed";
export type ChatMessageType = "text" | "system";
export type ChatMessageStatus = "sent" | "read";

export type ChatMessage = {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  message_type: ChatMessageType;
  status: ChatMessageStatus;
  deleted_at: string | null;
  edited_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatLastMessage = {
  content: string;
  sender_id: string;
  created_at: string;
  message_type: ChatMessageType;
};

export type ChatThreadWithMeta = {
  id: string;
  status: ChatThreadStatus;
  updated_at: string;
  volunteer_profile_id: string;
  shelter_profile_id: string;
  vacancy_title: string;
  vacancy_slug: string | null;
  other_participant_name: string;
  last_message: ChatLastMessage | null;
  unread_count: number;
};

export type ChatMessagePage = {
  messages: ChatMessage[];
  has_more: boolean;
  next_cursor: string | null;
};

export type CurrentThread = {
  id: string;
  otherName: string;
  otherProfileId: string;
  vacancyTitle: string;
};
