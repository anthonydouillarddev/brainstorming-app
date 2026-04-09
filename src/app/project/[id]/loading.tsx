export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 w-full animate-pulse">
      <div className="h-4 w-16 bg-border rounded mb-6" />
      <div className="h-8 w-64 bg-border rounded mb-3" />
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-7 w-20 bg-border rounded-full" />
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-5 mb-4">
          <div className="h-5 w-48 bg-border rounded mb-3" />
          <div className="h-20 w-full bg-border rounded" />
        </div>
      ))}
    </div>
  );
}
