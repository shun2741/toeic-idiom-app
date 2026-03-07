export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-12">
      <div className="rounded-[32px] border border-white/80 bg-white/92 px-8 py-10 shadow-soft">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
    </main>
  );
}
