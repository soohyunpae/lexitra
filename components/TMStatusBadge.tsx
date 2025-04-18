export default function TMStatusBadge({ status }: { status: string }) {
  const color =
    status === 'MT' ? 'gray' :
    status === 'Fuzzy' ? 'yellow' :
    status === 'Exact' ? 'blue' :
    status === 'Approved' ? 'green' :
    'black';

  const label =
    status === 'MT' ? 'Machine Translated' :
    status === 'Fuzzy' ? 'Fuzzy Match' :
    status === 'Exact' ? 'Exact Match' :
    status === 'Approved' ? 'Approved' :
    status;

  return (
    <span className={`px-2 py-1 rounded text-xs text-white bg-${color}-600`}>
      {label}
    </span>
  );
}