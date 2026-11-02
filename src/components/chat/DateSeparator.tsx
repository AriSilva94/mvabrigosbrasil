import { isToday, isYesterday, format } from "date-fns";
import { ptBR } from "date-fns/locale";

type DateSeparatorProps = {
  date: string;
};

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);

  if (isToday(date)) return "Hoje";
  if (isYesterday(date)) return "Ontem";

  return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export default function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="my-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="text-[11px] font-medium text-slate-400">
        {formatDateLabel(date)}
      </span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}
