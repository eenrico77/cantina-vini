// components/WineTypeBadge.jsx

export function WineTypeBadge({ type }) {
  let colorClasses = '';

  switch (type) {
    case 'Rosso':
      colorClasses = 'bg-red-100 text-red-800';
      break;
    case 'Bianco':
      colorClasses = 'bg-yellow-100 text-yellow-800';
      break;
    case 'Bollicine':
      colorClasses = 'bg-blue-100 text-blue-800';
      break;
    case 'Rosato':
      colorClasses = 'bg-pink-100 text-pink-800';
      break;
    case 'Dolce':
      colorClasses = 'bg-purple-100 text-purple-800';
      break;
    case 'Tutti': // Aggiunto per i filtri
      colorClasses = 'bg-gray-800 text-white';
      break;
    default:
      colorClasses = 'bg-sand-100 text-ink-500';
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colorClasses}`}
    >
      {type}
    </span>
  );
}