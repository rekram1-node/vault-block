const EncryptedDocumentSkeleton = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative mt-4 flex w-full flex-col items-center rounded-xl border-2 bg-card shadow-md">
        <div className="w-full">
          <div className="card variant-glass flex items-center justify-start p-6">
            <div className="mr-4 h-6 w-6 animate-pulse rounded bg-gray-300"></div>
            <div className="h-6 w-1/2 animate-pulse rounded bg-gray-300"></div>
            <div className="ml-auto flex items-center space-x-3">
              <div className="mr-1 h-6 w-6 animate-pulse rounded bg-gray-300"></div>
              <div className="h-6 w-6 animate-pulse rounded bg-gray-300"></div>
              <div className="h-6 w-6 animate-pulse rounded bg-gray-300"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncryptedDocumentSkeleton;
