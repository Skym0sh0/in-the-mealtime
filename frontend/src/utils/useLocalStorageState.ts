import {useCallback, useEffect, useState} from "react";

export default function useLocalStorageState(key: string, initialValue?: string | null): [string | null, (newValue: string | null) => void] {
  const [value, setValue] = useState<string | null>(null);

  useEffect(() => {
    const old = localStorage.getItem(key)

    if (old !== null)
      setValue(old)
    else
      setValue(initialValue ?? null)
  }, [initialValue, key]);

  const setPersistentValue = useCallback((newValue: string | null) => {
    setValue(newValue)
    if (newValue)
      localStorage.setItem(key, newValue)
    else
      localStorage.removeItem(key)
  }, [key])

  return [value, setPersistentValue]
}
