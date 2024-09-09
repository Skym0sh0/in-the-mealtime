import {IconButton, Stack, TextField, Tooltip} from "@mui/material";
import {useCallback, useMemo} from "react";
import {TextFieldProps} from "@mui/material/TextField/TextField";
import PaletteIcon from '@mui/icons-material/Palette';

export type ColorPickerProps = {
  value?: string;
  onChange?: (newValue?: string) => void;
} & Pick<TextFieldProps, 'size'>;

type Color = {
  r: number;
  g: number;
  b: number;
}

function colorToHex({r, g, b}: Color): string {
  return [
    '#',
    ...[r, g, b].map(c => c.toString(16))
      .map(s => `00${s}`)
      .map(s => s.substring(s.length - 2))
  ]
    .join('');
}

export function randomColor(): string {
  const color: Color = {
    r: Math.round(Math.random() * 256),
    g: Math.round(Math.random() * 256),
    b: Math.round(Math.random() * 256),
  };

  return colorToHex(color);
}

export default function ColorPicker({value, onChange, size}: ColorPickerProps) {
  const color: Color = useMemo(() => {
    const pattern = /^#([0-9a-f]{6})$/i;
    const p = pattern.test(value ?? '')

    if (!p || !value)
      return {r: 0, g: 0, b: 0};

    const comps = Array(3).fill(null)
      .map((_, idx) => 2 * idx)
      .filter(idx => idx < value.length)
      .map(idx => value.substring(1 + idx, 1 + idx + 2))
      .map(comp => Number.parseInt(comp, 16))
      .map(c => Number.isNaN(c) ? 0 : c)

    return {
      r: comps[0],
      g: comps[1],
      b: comps[2],
    };
  }, [value]);

  const onClickRandom = useCallback(() => {
    onChange?.(randomColor())
  }, [onChange]);

  const handleColorChange = useCallback((color: Color) => {
    const newColor = colorToHex(color)
    onChange?.(newColor);
  }, [onChange]);

  const onChangeComponent = useCallback((component: keyof Color, value: string) => {
    const raw = Number.parseInt(value);
    const number = Number.isNaN(raw) ? 0 : raw;

    if (0 <= number && number < 256)
      handleColorChange({...color, [component]: number});
  }, [color, handleColorChange]);

  const colors: { name: string, key: keyof Color }[] = [
    {name: 'Rot', key: 'r'},
    {name: 'Grün', key: 'g'},
    {name: 'Blau', key: 'b'},
  ]

  return <Stack direction="row" spacing={0} alignItems="center">
    {colors.map(c => {
      return <TextField key={c.key}
                        size={size}
                        type="number"
                        label={c.name}
                        value={color[c.key]}
                        onChange={e => onChangeComponent(c.key, e.target.value)}
                        sx={{width: '9ch'}}/>
    })}
    <Tooltip title="Zufällige Farbe">
      <IconButton onClick={onClickRandom} color="secondary">
        <PaletteIcon fontSize="small"/>
      </IconButton>
    </Tooltip>
  </Stack>
}
