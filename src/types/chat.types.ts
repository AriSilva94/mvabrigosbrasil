// Types for the chat system (volunteer <-> shelter)

export type ChatThreadStatus = 'active' | 'archived' | 'closed';
export type ChatMessageType = 'text' | 'system';
export type ChatParticipantRole = 'volunteer' | 'shelter';
export type ChatReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'actioned';

export type ChatThread = {
  id: string;
  vacancy_id: string;
  volunteer_profile_id: string;
  shelter_profile_id: string;
  shelter_id: string;
  volunteer_id: string;
  application_id: string | null;
  status: ChatThreadStatus;
  created_at: string;
  updated_at: string;
};

export type ChatParticipant = {
  id: string;
  thread_id: string;
  profile_id: string;
  role: ChatParticipantRole;
  last_read_at: string;
  is_active: boolean;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  message_type: ChatMessageType;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ChatAttachment = {
  id: string;
  message_id: string;
  thread_id: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
};

export type ChatBlock = {
  id: string;
  blocker_id: string;
  blocked_id: string;
  reason: string | null;
  created_at: string;
};

export type ChatReport = {
  id: string;
  reporter_id: string;
  thread_id: string | null;
  message_id: string | null;
  reported_user_id: string;
  reason: string;
  status: ChatReportStatus;
  created_at: string;
  updated_at: string;
};

// Tipos compostos para a UI

export type ChatThreadWithMeta = ChatThread & {
  vacancy_title: string;
  vacancy_slug: string | null;
  other_participant_name: string;
  last_message: {
    content: string;
    sender_id: string;
    created_at: string;
    message_type: ChatMessageType;
  } | null;
  unread_count: number;
};

export type ChatMessageWithAttachments = ChatMessage & {
  chat_attachments?: ChatAttachment[];
};
