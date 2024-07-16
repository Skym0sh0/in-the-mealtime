import {useCallback, useEffect, useMemo, useState} from "react";
import {MenuPage, Restaurant} from "../../../build/generated-ts/api/api.ts";
import {IconButton, Paper, Stack, Typography, useTheme} from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DeleteIcon from "@mui/icons-material/Delete";
import {MuiFileInput} from "mui-file-input";
import {v4 as uuidv4} from "uuid";
import UndoIcon from '@mui/icons-material/Undo';
import _ from "lodash";
import FiberNewIcon from '@mui/icons-material/FiberNew';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import {api} from "../../api/api.ts";

const isSortingDisabled = true; // is disabled since Sorting is not incorporated into Rest API

type PageOrFile = { file: File, page?: never } | { file?: never, page: MenuPage };

type EditorMenuPage = {
  id: string,
  alreadyExisted: boolean,
  toBeDeleted: boolean,
} & PageOrFile;

type FileWithId = {
  id: string,
  file: File,
}

export default function MenuPageEditor({restaurant, onChange, onInit}: {
  restaurant: Restaurant,
  onChange: () => void;
  onInit?: (action: (rest: Restaurant) => Promise<void>) => void,
}) {
  const [newFiles, setNewFiles] = useState<FileWithId[]>([])
  const [existingPagesToDelete, setExistingPagesToDelete] = useState<string[]>([])
  const menuPages = useMemo(() => {
    return restaurant.menuPages ?? [];
  }, [restaurant.menuPages]);

  const [sorting, setSorting] = useState<string[]>([]);
  useEffect(() => {
    setSorting([...menuPages.map(p => p.id), ...newFiles.map(p => p.id)])
  }, [menuPages, newFiles]);
  const moveUp = useCallback((idx: number) => {
    setSorting(prev => {
      if (idx === 0)
        return prev;

      return [
        ...prev.slice(0, idx - 1),
        prev[idx],
        prev[idx - 1],
        ...prev.slice(idx + 1)
      ];
    });
  }, []);
  const moveDown = useCallback((idx: number) => {
    setSorting(prev => {
      if (idx === prev.length - 1)
        return prev;

      return [
        ...prev.slice(0, idx),
        prev[idx + 1],
        prev[idx],
        ...prev.slice(idx + 2)
      ];
    })
  }, []);

  const pages = useMemo(() => {
    const existingPages: EditorMenuPage[] = menuPages.map(page => ({
      id: page.id,
      alreadyExisted: true,
      toBeDeleted: existingPagesToDelete.includes(page.id),
      page: page,
    }))

    const transformedNewFiles: EditorMenuPage[] = newFiles.map((fileWithId) => ({
      id: fileWithId.id,
      alreadyExisted: false,
      toBeDeleted: false,
      file: fileWithId.file,
    }))

    return _.sortBy([...existingPages, ...transformedNewFiles], (page) => sorting.indexOf(page.id))
  }, [menuPages, newFiles, existingPagesToDelete, sorting])

  const addFiles = useCallback((files: File[]) => {
    onChange()

    setNewFiles(prev => {
      const filesWithId: FileWithId[] = files.map(f => ({
        id: uuidv4(),
        file: f
      }));

      setSorting(prevSorting => [...prevSorting, ...filesWithId.map(f => f.id)])

      return [...prev, ...filesWithId]
    })

  }, [onChange]);

  const removeFile = useCallback((page: EditorMenuPage) => {
    if (page.alreadyExisted)
      return;
    setNewFiles(prev => prev.filter(f => f.id !== page.id))
  }, []);
  const removePage = useCallback((page: EditorMenuPage) => {
    if (!page.alreadyExisted)
      return;
    setExistingPagesToDelete(prev => [...prev, page.id])
  }, []);
  const undoRemove = useCallback((page: EditorMenuPage) => {
    if (!page.alreadyExisted && !page.toBeDeleted)
      return;
    setExistingPagesToDelete(prev => prev.filter(id => id !== page.id))
  }, []);

  const onSave = useCallback((restaurant: Restaurant) => {
    return Promise.all([
        ...existingPagesToDelete.map(id => api.restaurants.deleteRestaurantsMenuPage(restaurant.id, id)),
        ...newFiles.map(f => f.file).map(file => api.restaurants.addRestaurantsMenuPage(restaurant.id, file))
      ]
    )
      .then(() => {
        setExistingPagesToDelete([])
        setNewFiles([])
      })
  }, [existingPagesToDelete, newFiles]);

  useEffect(() => {
    onInit?.(onSave)
  }, [onInit, onSave]);

  return <Paper elevation={1} sx={{p: 1}}>
    <Stack spacing={2}>
      <MuiFileInput multiple={true}
                    size="small"
                    inputProps={{accept: '.png, .jpg, .jpeg, .gif, .webp'}}
                    placeholder="Bilder für Menü Karte hier hinzufügen ..."
                    value={[]}
                    onChange={addFiles}>
      </MuiFileInput>

      {pages && pages.length > 0 &&
        <Stack spacing={1}>
          {
            pages.map((page, idx) => {
              return <SinglePage key={page.id}
                                 page={page}
                                 restaurant={restaurant}
                                 moveUp={() => moveUp(idx)}
                                 moveDown={() => moveDown(idx)}
                                 removeFile={() => removeFile(page)}
                                 removePage={() => removePage(page)}
                                 undoRemove={() => undoRemove(page)}
              />
            })
          }
        </Stack>
      }
    </Stack>
  </Paper>
}

function SinglePage({page, restaurant, moveUp, moveDown, removePage, removeFile, undoRemove}: {
  page: EditorMenuPage,
  restaurant: Restaurant,
  moveUp: () => void,
  moveDown: () => void,
  removePage: () => void,
  undoRemove: () => void,
  removeFile: () => void,
}) {
  const theme = useTheme();

  const color = page.toBeDeleted
    ? theme.palette.error.main
    : page.alreadyExisted
      ? theme.palette.grey["300"]
      : theme.palette.success.main

  return <Stack direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{border: `1px solid ${color}`, textDecoration: page.toBeDeleted ? 'line-through' : undefined}}>
    <div style={{width: '2em', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      {!page.alreadyExisted
        ? <FiberNewIcon fontSize="small" color="success"/>
        : page.toBeDeleted
          ? <HighlightOffIcon fontSize="small" color="error"/>
          : null
      }
    </div>

    <PageThumbnail restaurant={restaurant} page={page}/>

    <Typography style={{flexGrow: 1}}>
      {page.page?.name ?? page.file?.name}
    </Typography>

    <Stack direction="row">
      {!isSortingDisabled && <>
        <IconButton size="small" onClick={moveUp} color="info">
          <ArrowUpwardIcon fontSize="inherit"/>
        </IconButton>
        <IconButton size="small" onClick={moveDown} color="info">
          <ArrowDownwardIcon fontSize="inherit"/>
        </IconButton>
      </>
      }

      {
        page.alreadyExisted
          ? page.toBeDeleted
            ? <IconButton size="small" onClick={undoRemove} color="secondary">
              <UndoIcon fontSize="inherit"/>
            </IconButton>
            : <IconButton size="small" onClick={removePage} color="warning">
              <DeleteIcon fontSize="inherit"/>
            </IconButton>

          : <IconButton size="small" onClick={removeFile} color="warning">
            <DeleteIcon fontSize="inherit"/>
          </IconButton>
      }
    </Stack>
  </Stack>;
}

function PageThumbnail({restaurant, page}: { restaurant: Restaurant, page: EditorMenuPage }) {
  const [image, setImage] = useState('https://placehold.co/48');

  useEffect(() => {
    if (page.file) {
      setImage(URL.createObjectURL(page.file))
    } else {
      api.restaurants.fetchRestaurantsMenuPage(restaurant.id, page.id, true, {responseType: 'blob'})
        .then(res => URL.createObjectURL(new Blob([res.data])))
        .then(img => setImage(img))
    }

    return () => {
      if (image)
        URL.revokeObjectURL(image)
    }
  }, []);

  return <div style={{
    width: '48px',
    height: '48px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  }}>
    <img
      width="48px"
      height="48px"
      src={image}
      style={{objectFit: 'contain', objectPosition: 'center'}}
      alt={page.page?.name ?? page.file?.name}
    />
  </div>
}
