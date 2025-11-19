'use client';

interface ErrorPageProps {
  error: Error;
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main>
      <h1>Ocorreu um erro</h1>
      <p>{error.message}</p>
      <button type="button" onClick={reset}>
        Tentar novamente
      </button>
    </main>
  );
}
