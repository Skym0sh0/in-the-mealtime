import React from "react";

export default function LoadingIndicator({isLoading, children}: { isLoading: boolean, children: React.ReactNode }) {
  if (isLoading)
    return <div>
      is loading ...
    </div>;

  return <>{children}</>;
}
