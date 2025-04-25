export default function TMStatusBadge({ status }: { status: string }) {
  const statusColorMap: Record<string, string> = {
    MT: 'bg-gray-600',
    Fuzzy: 'bg-yellow-600',
    '100%': 'bg-blue-600',
    Reviewed: 'bg-green-600',
  };

  const statusLabelMap: Record<string, string> = {
    MT: 'MT',
    Fuzzy: 'Fuzzy',
    '100%': '100%',
    Reviewed: 'Reviewed',
  };

  const className = statusColorMap[status] || 'bg-black';
  const label = statusLabelMap[status] || status;

  return (
    <span className={`px-2 py-1 rounded text-xs text-white ${className}`}>
      {label}
    </span>
  );
}