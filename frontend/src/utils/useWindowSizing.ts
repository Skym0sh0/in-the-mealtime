import {useEffect, useState} from "react";

export default function useWindowSizing() {
  const [dimensions, setDimensions] = useState<number[]>([window.innerWidth, window.innerHeight]);

  const callback = (e: any) => {
    setDimensions([e.target.innerWidth, e.target.innerHeight])
  }

  useEffect(() => {
    window.addEventListener('resize', callback)
    return () => window.removeEventListener('resize', callback)
  }, []);

  return dimensions;
}
