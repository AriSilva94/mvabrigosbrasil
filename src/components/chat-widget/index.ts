export { default as ChatWidget } from "./ChatWidget";

export function openChatWidget(detail?: {
  threadId?: string;
  otherName?: string;
  vacancyTitle?: string;
}) {
  window.dispatchEvent(new CustomEvent("open-chat-widget", { detail }));
}
