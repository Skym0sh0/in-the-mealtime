import {createContext, ReactNode, useContext, useState} from 'react';
import Dialog from '@mui/material/Dialog';
import {Button, DialogActions, DialogContent, DialogContentText, DialogTitle,} from '@mui/material';

export interface DialogOptions {
  title?: string;
  content?: ReactNode;
  confirmText?: string;
  cancelText?: string;
}

export interface DialogContextType {
  confirmDialog: (options: DialogOptions) => Promise<boolean>;
}

const ConfirmationDialogContext = createContext<DialogContextType>({
  confirmDialog: () => Promise.resolve(false),
});

export const useConfirmationDialog = () => useContext(ConfirmationDialogContext);

export const ConfirmationDialogProvider = ({children}: { children: ReactNode }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<DialogOptions>({});
  const [resolveReject, setResolveReject] = useState<[(value: boolean | PromiseLike<boolean>) => void, (reason?: any) => void]>([
    () => {
    },
    () => {
    },
  ]);

  const confirmDialog = (options: DialogOptions) => {
    setDialogOpen(true);
    setDialogConfig(options);

    return new Promise<boolean>((resolve, reject) => {
      setResolveReject([resolve, reject]);
    });
  };

  const handleClose = (result: boolean) => {
    setDialogOpen(false);
    resolveReject[0](result);
  };

  return <ConfirmationDialogContext.Provider value={{confirmDialog}}>
    {children}
    <Dialog
      open={dialogOpen}
      onClose={() => handleClose(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {dialogConfig.title}
      </DialogTitle>

      <DialogContent>
        <DialogContentText id="alert-dialog-description" component="div">
          {dialogConfig.content}
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={() => handleClose(false)} color="secondary" variant="contained">
          {dialogConfig.cancelText || 'Nein'}
        </Button>

        <Button onClick={() => handleClose(true)} color="primary" variant="contained" autoFocus>
          {dialogConfig.confirmText || 'Ja'}
        </Button>
      </DialogActions>
    </Dialog>
  </ConfirmationDialogContext.Provider>;
}
