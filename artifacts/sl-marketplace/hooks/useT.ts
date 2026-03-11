import { useApp } from "@/context/AppContext";
import { strings } from "@/constants/strings";

export function useT() {
  const { language } = useApp();
  return (key: string): string => strings[language][key] ?? strings["en"][key] ?? key;
}
