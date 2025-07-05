import { format } from "date-fns";
import { enUS } from "date-fns/locale";

export function formatDate(date: Date | string, formatStr: string = "MMM d, yyyy HH:mm") {
  return format(new Date(date), formatStr, { locale: enUS });
}
