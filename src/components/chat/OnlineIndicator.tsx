import clsx from "clsx";

type OnlineIndicatorProps = {
  isOnline: boolean;
  size?: "sm" | "md";
};

export default function OnlineIndicator({ isOnline, size = "sm" }: OnlineIndicatorProps) {
  return (
    <span
      className={clsx(
        "inline-block shrink-0 rounded-full ring-2 ring-white",
        isOnline ? "bg-green-500" : "bg-gray-300",
        size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"
      )}
      title={isOnline ? "Online" : "Offline"}
    />
  );
}
