import {createContext, ReactNode, useContext, useState} from "react";
import Dialog from "@mui/material/Dialog";
import {DialogActions, DialogContent, DialogTitle} from "@mui/material";

export type DialogOptions = {
  title?: JSX.Element;
  content: JSX.Element;
  actions?: JSX.Element;

  onSuccess?: () => void;
}

export type DialogContextType = {
  openDialog: (options: DialogOptions) => Promise<unknown>;
}

const DataModalDialogContext = createContext<DialogContextType>({
  openDialog: () => Promise.resolve(undefined),
});

export const useDataModalDialog = () => useContext(DataModalDialogContext);

export const DataModalDialogProvider = ({children}: { children: ReactNode }) => {
  const [options, setOptions] = useState<DialogOptions>()

  const openDialog = (options: DialogOptions) => {
    setOptions(options);

    return Promise.resolve(undefined);
  }

  const handleClose = () => {
    setOptions(undefined);
  };

  return <DataModalDialogContext.Provider value={{openDialog}}>
    {children}

    <Dialog open={!!options}
            onClose={handleClose}>
      {options?.title &&
        <DialogTitle>
          {options.title}
        </DialogTitle>
      }

      {options?.content &&
        <DialogContent>
          {options.content}
        </DialogContent>
      }

      {options?.actions &&
        <DialogActions>
          {options.actions}
        </DialogActions>
      }
    </Dialog>
  </DataModalDialogContext.Provider>
}
