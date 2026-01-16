import React from 'react';

type StatusTagProps = {
  status: string;
};

const StatusTag: React.FC<StatusTagProps> = ({ status }) => {

 if (!status) {
    return (
      <span className="inline-block px-3 py-1 text-sm font-semibold rounded-[6px] bg-gray-300 text-gray-700">
        Unknown
      </span>
    );
  }
  

  let statusColor = '';

  switch (status) {
    case 'DRAFT':
      statusColor = 'bg-blue-500 text-white';
      break;
    case 'ARCHIVED':
      statusColor = 'bg-gray-500 text-white';
      break;
    case 'REFUSED':
      statusColor = 'bg-red-500 text-white';
      break;
    case 'PUBLISHED':
      statusColor = 'bg-green-500 text-white';
      break;
    default:
      statusColor = 'bg-gray-300 text-gray-700';
  }

  return (
    <span
      className={`inline-block px-3 py-1 text-sm font-semibold rounded-[6px] ${statusColor}`}
    >
      {status.toLowerCase()}{' '}
    </span>
  );
};

export default StatusTag;
