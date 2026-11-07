import { message } from "@/shared/api/http";

export function RemoteState({
  query,
}: {
  query: {
    isPending: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => unknown;
    isFetching?: boolean;
  };
}) {
  if (query.isPending)
    return (
      <p role="status" className="p-6">
        Carregando…
      </p>
    );
  if (query.isError)
    return (
      <div role="alert" className="p-6">
        {message(query.error)}{" "}
        <button onClick={() => void query.refetch()}>Tentar novamente</button>
      </div>
    );
  if (query.isFetching)
    return (
      <span aria-hidden="true" className="sr-only">
        Atualizando…
      </span>
    );
  return null;
}
