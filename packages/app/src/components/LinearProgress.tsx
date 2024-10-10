export function LinearProgress() {
  return (
    <div className="w-full">
      <div className="h-1.5 w-full overflow-hidden bg-slate-600">
        <div className="animate-progress origin-left-right h-full w-full bg-slate-300"></div>
      </div>
    </div>
  );
}
