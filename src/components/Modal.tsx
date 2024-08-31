import { LoadingSpinner } from "./Loading";

export function Modal({
  title,
  content,
  actionText,
  isLoading,
  onCancel,
  onConfirm,
}: {
  title: string;
  content: JSX.Element;
  actionText?: string;
  isLoading: boolean;
  onCancel(): void;
  onConfirm(): void;
}) {
  const actionTxt = actionText ?? "Delete";

  const handleModalClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onCancel}
    >
      <div
        className="rounded-lg border bg-background p-4 shadow-lg"
        onClick={handleModalClick}
      >
        <h2 className="text-lg font-bold">{title}</h2>
        {content}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className={`rounded bg-primary px-4 py-2 hover:brightness-75`}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className={`rounded bg-error-light px-4 py-2 hover:brightness-75`}
            onClick={onConfirm}
          >
            {!isLoading ? actionTxt : <LoadingSpinner />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
