import {Restaurant} from "../../../../build/generated-ts/api";
import {Button, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from "@mui/material";
import {ChangeEvent, FormEvent, useCallback, useState} from "react";
import {useApiAccess} from "../../../utils/ApiAccessContext.tsx";
import {useNotification} from "../../../utils/NotificationContext.tsx";
import Dialog from "@mui/material/Dialog";
import {useNavigate} from "react-router-dom";
import {DateTime} from "luxon";

export type NewOrderDialogProps = {
  restaurant: Restaurant,
  onOrderOpened: () => void,
  onAbort: () => void
}

type FormDataType = {
  creator: string,
  targetDate: DateTime,
}

export default function NewOrderDialog({restaurant, onOrderOpened, onAbort}: NewOrderDialogProps) {
  const {orderApi} = useApiAccess();
  const {notifyError, notifySuccess} = useNotification();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormDataType>({
    creator: '',
    targetDate: DateTime.now().set({hour: 0, minute: 0, second: 0, millisecond: 0}),
  })

  const onOpen = useCallback((e: FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    const payload = {
      creator: formData.creator,
      targetDate: formData.targetDate.toISODate() ?? ''
    };

    orderApi.createOrder(restaurant.id, payload)
      .then(res => res.data)
      .then(newOrder => {
        notifySuccess("Neue Bestellung eröffnet")
        onOrderOpened()
        navigate({pathname: `/order/${newOrder.id}`})
      })
      .catch(e => notifyError("Konnte keine neue Order erstellen", e))
      .finally(() => setIsLoading(false))
  }, [formData.creator, formData.targetDate, navigate, notifyError, notifySuccess, onOrderOpened, orderApi, restaurant.id])

  const onClose = () => {
    onAbort()
  }

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target

    setFormData({...formData, [name]: value})
  }, [formData])

  return <Dialog open={true}
                 component="form"
                 onSubmit={onOpen}>
    <DialogTitle>
      Bestellung bei "{restaurant.name}"
    </DialogTitle>

    <DialogContentText>
      Bla bla bla
    </DialogContentText>

    <DialogContent style={{padding: "10px"}}>
      <TextField label="Name"
                 name="creator"
                 placeholder="Name"
                 value={formData.creator}
                 onChange={handleChange}
                 required={true}/>
    </DialogContent>

    <DialogActions>
      <div>
        {JSON.stringify(formData)}
      </div>

      <Button onClick={onClose} color="error" variant="contained" size="small">
        Abbrechen
      </Button>

      <Button disabled={isLoading} type="submit" color="primary" variant="contained" size="small">
        Eröffnen
      </Button>
    </DialogActions>
  </Dialog>
}
