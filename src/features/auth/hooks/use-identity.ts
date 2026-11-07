import { sessionOptions } from "@/features/auth/api/queries";
import { useQuery } from "@tanstack/react-query";

export function useIdentity() {
  const session = useQuery(sessionOptions);
  return { ...session, id: session.data?.user.id ?? "guest" };
}
