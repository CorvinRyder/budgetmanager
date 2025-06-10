"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

declare global {
  type AlertDialogParams = {
    open: boolean;
    title?: string;
    content?: string;
    jsx?: React.ReactNode;
    OkButtonLabel?: string;
    CancelButtonLabel?: string;
    OnDialogOk?: () => void;
    OnDialogCancel?: () => void;
    OnDialogShow?: () => void;
    DialogProps?: KeyValueList<any>;
    noOkButton?: boolean;
  };

  type KeyValueList<V> = {
    [index: string | number | symbol]: V;
  };
}
type AlertDialogProps = {
  params?: AlertDialogParams;
};

export default function AlertDialog(props: AlertDialogProps) {
  const isOnMobile = window.matchMedia("(max-aspect-ratio: 0.999)").matches;
  let params = props.params || ({} as AlertDialogParams);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!("open" in params)) return;
    if (params.open != open) setOpen(params.open);
    params.open && params.OnDialogShow && params.OnDialogShow();
  }, [params]);

  const handleClose = (isOk: boolean) => {
    setOpen(false);
    if (isOk) params.OnDialogOk && params.OnDialogOk();
    else params.OnDialogCancel && params.OnDialogCancel();
  };

  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      disableEscapeKeyDown
      fullWidth={isOnMobile}
      {...params.DialogProps}
    >
      <DialogTitle id="alert-dialog-title">{params.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {params.content}
        </DialogContentText>
        {params.jsx}
      </DialogContent>
      <DialogActions>
        {params.OnDialogCancel && (
          <Button variant="outlined" onClick={() => handleClose(false)}>
            {params.CancelButtonLabel || "Cancel"}
          </Button>
        )}
        {!params.noOkButton && (
          <Button
            variant="contained"
            onClick={() => handleClose(true)}
            autoFocus
          >
            {params.OkButtonLabel || "OK"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
