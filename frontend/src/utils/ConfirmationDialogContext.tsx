import {createContext, ReactNode, useContext, useState} from 'react';
import Dialog from '@mui/material/Dialog';
import {Button, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography,} from '@mui/material';

export interface DialogOptions {
  title?: string;

  caption?: string;
  importantCaption?: string;
  tip?: string;

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

    <Dialog open={dialogOpen} onClose={() => handleClose(false)}>
      <DialogTitle id="alert-dialog-title">
        {dialogConfig.title}
      </DialogTitle>

      <DialogContent>
        <DialogContentText id="alert-dialog-description" component="div"
                           style={{display: 'flex', flexDirection: 'column', gap: '1em'}}>
          {dialogConfig.caption &&
            <Typography variant="body2">
              {dialogConfig.caption}
            </Typography>
          }

          {dialogConfig.tip &&
            <Typography variant="caption">
              {dialogConfig.tip}
            </Typography>
          }

          {dialogConfig.importantCaption &&
            <Typography variant="subtitle2" color="error">
              {dialogConfig.importantCaption}
            </Typography>
          }
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{display: 'flex', gap: '1em', justifyContent: 'center', alignItems: 'center'}}>
        <Button onClick={() => handleClose(false)} color="error" variant="contained">
          {dialogConfig.cancelText || 'Nein'}
        </Button>

        <Button onClick={() => handleClose(true)} color="success" variant="contained" autoFocus>
          {dialogConfig.confirmText || 'Ja'}
        </Button>
      </DialogActions>
    </Dialog>
  </ConfirmationDialogContext.Provider>;
}
