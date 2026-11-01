const Loading = () => {
  return (
    <div className="flex h-full min-h-60 w-full items-center justify-center bg-surface">
      <div
        role="status"
        aria-label="Loading"
        className="h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-transparent"
      />
    </div>
  );
};

export default Loading;
