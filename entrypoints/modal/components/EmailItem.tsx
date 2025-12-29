type Props = {
  email: string;
  isDismissed?: boolean;
  onDismiss: (email: string) => void;
};

export function EmailItem({ email, isDismissed, onDismiss }: Props) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-lg">📧</span>
        <span className="font-mono text-sm text-gray-800">{email}</span>
        {isDismissed && (
          <span className="rounded-full bg-lasso-cream px-2 py-0.5 text-xs text-lasso-brown">
            Dismissed
          </span>
        )}
      </div>
      {!isDismissed && (
        <button
          onClick={() => onDismiss(email)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100"
        >
          Dismiss 24h
        </button>
      )}
    </div>
  );
}
