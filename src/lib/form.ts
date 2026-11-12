// Ajudas para ler FormData e o formato de estado devolvido pelas Server Actions.
export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  ok?: boolean;
};

export function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export function optStr(fd: FormData, key: string): string | undefined {
  const v = str(fd, key);
  return v === "" ? undefined : v;
}

export function optInt(fd: FormData, key: string): number | undefined {
  const v = str(fd, key);
  if (v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function optBool(fd: FormData, key: string): boolean | undefined {
  const v = str(fd, key);
  if (v === "yes") return true;
  if (v === "no") return false;
  return undefined;
}
