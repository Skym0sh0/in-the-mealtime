import {TextFieldProps} from "@mui/material/TextField/TextField";
import {TextField, InputAdornment} from "@mui/material";
import {useCallback, useEffect, useMemo, useState} from "react";
import {formatMonetaryInput, parseMonetaryInput} from "../../../utils/moneyUtils.ts";

export type MoneyInputFieldProps = {
  value?: number;
  onChange?: (newValue?: number) => void;

  disablePositiv?: boolean;
  disableZero?: boolean;
  disableNegative?: boolean;
} & Omit<Omit<TextFieldProps, 'onChange'>, 'value'>;

export default function MoneyInputField({
                                          value,
                                          onChange,
                                          disablePositiv,
                                          disableZero,
                                          disableNegative,
                                          error,
                                          helperText,
                                          ...props
                                        }: MoneyInputFieldProps) {
  const [input, setInput] = useState('');
  const [parsingError, setParsingError] = useState<string | null>(null)

  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (value === undefined) {
      setInput('');
    } else {
      setInput((value / 100.0).toString());
    }
  }, [value]);

  const onInputChange = useCallback((newValue: string) => {
    setParsingError(null)

    if (newValue === '') {
      onChange?.(undefined)
      return;
    }

    const parsed = parseMonetaryInput(newValue);

    if (Number.isNaN(parsed)) {
      setParsingError("fehlerhaft")
      return;
    }

    if (disablePositiv && parsed > 0) {
      setParsingError("Positiv verboten")
      return;
    }
    if (disableZero && parsed === 0) {
      setParsingError("0 verboten")
      return;
    }
    if (disableNegative && parsed < 0) {
      setParsingError("Negativ verboten")
      return;
    }

    onChange?.(parsed);
  }, [disableNegative, disablePositiv, disableZero, onChange]);

  const beautifiedValue = useMemo(() => {
    return formatMonetaryInput(value) ?? '';
  }, [value]);

  return <TextField {...props}
                    type="number"
                    value={isFocused ? input : beautifiedValue}
                    onChange={e => onInputChange(e.target.value)}
                    error={!!parsingError || error}
                    helperText={parsingError ?? helperText}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">€</InputAdornment>
                    }}
  />
}
