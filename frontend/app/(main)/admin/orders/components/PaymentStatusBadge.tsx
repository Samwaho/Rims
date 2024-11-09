export const PaymentStatusBadge = ({ status }: { status: string }) => {
  const statusStyles = {
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div
      className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
        statusStyles[status as keyof typeof statusStyles] ||
        statusStyles.pending
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  );
};
