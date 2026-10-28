// Format currency in Indian Rupees with ₹ symbol
export const formatRupee = (amount) => {
  if (amount == null || isNaN(amount)) return '₹0';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
};

// Format Date e.g. "Wed, 28 Oct 2026"
export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// Format Time e.g. "5:30 PM"
export const formatTime = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  return d.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Format DateTime
export const formatDateTime = (dateInput) => {
  if (!dateInput) return '';
  return `${formatDate(dateInput)} at ${formatTime(dateInput)}`;
};

