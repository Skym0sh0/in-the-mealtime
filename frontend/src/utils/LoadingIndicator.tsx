import React from "react";
import {Backdrop, CircularProgress} from "@mui/material";

export default function LoadingIndicator({isLoading, children}: { isLoading: boolean, children: React.ReactNode }) {
  if (isLoading)
    return <Backdrop open={isLoading}>
      <CircularProgress color="inherit"/>
    </Backdrop>;

  return <>{children}</>;
}
