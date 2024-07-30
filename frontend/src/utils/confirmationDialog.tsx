import {Button, DialogActions, DialogContent, DialogContentText, DialogTitle,} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import {ReactNode} from "react";
import {createRoot} from "react-dom/client";

export interface DialogOptions {
  title: string;
  content?: ReactNode;
  confirmText?: string;
  cancelText?: string;
}

export default function confirmDialog(options: DialogOptions) {
  return new Promise((resolve) => {
    const dialogRoot = document.createElement('div');
    document.body.appendChild(dialogRoot);
    const root = createRoot(dialogRoot);

    const handleClose = (result: boolean) => {
      root.unmount()
      document.body.removeChild(dialogRoot);
      resolve(result);
    };

    root.render(
      <Dialog open={true} onClose={() => handleClose(false)}>
        <DialogTitle id="alert-dialog-title">
          {options.title}
        </DialogTitle>

        <DialogContent id="alert-dialog-description">
          <DialogContentText component="div">
            {options.content}
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => handleClose(false)} color="secondary" variant="contained">
            {options.cancelText || 'Nein'}
          </Button>
          <Button onClick={() => handleClose(true)} color="primary" variant="contained" autoFocus>
            {options.confirmText || 'Ja'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  });
}