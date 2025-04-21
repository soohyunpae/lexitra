export default function TMStatusBadge({ status }: { status: string }) {
  const statusColorMap: Record<string, string> = {
    MT: 'bg-gray-600',
    Fuzzy: 'bg-yellow-600',
    Exact: 'bg-blue-600',
    Approved: 'bg-green-600',
  };

  const statusLabelMap: Record<string, string> = {
    MT: 'Machine Translated',
    Fuzzy: 'Fuzzy Match',
    Exact: 'Exact Match',
    Approved: 'Approved',
  };

  const className = statusColorMap[status] || 'bg-black';
  const label = statusLabelMap[status] || status;

  return (
    <span className={`px-2 py-1 rounded text-xs text-white ${className}`}>
      {label}
    </span>
  );
}