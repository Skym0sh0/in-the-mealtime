import {ReactNode, useCallback, useEffect, useMemo, useState} from "react";
import {Box, Card, CardMedia, Modal, Pagination, Stack, Typography} from "@mui/material";
import {api} from "../../api/api.ts";
import {v4 as uuidv4} from "uuid";
import LoadingIndicator from "../../utils/LoadingIndicator.tsx";
import {Restaurant} from "../../../build/generated-ts/api";

type MenuPageImageProps = {
  page: Page,
  opened: boolean,
  navigation: ReactNode,
  onSelect: () => void,
};

function MenuPageImage({page, opened, onSelect, navigation}: MenuPageImageProps) {
  const [loading, setLoading] = useState(false)
  const [thumbnail, setThumbnail] = useState<string>('')
  const [fullsize, setFullsize] = useState<string>('')

  useEffect(() => {
    setLoading(true)

    Promise.all([
      api.restaurants.fetchRestaurantsMenuPage(uuidv4(), uuidv4(), true, {responseType: 'blob'})
        .then(res => URL.createObjectURL(new Blob([res.data])))
        .then(img => setThumbnail(img)),
      api.restaurants.fetchRestaurantsMenuPage(uuidv4(), uuidv4(), false, {responseType: 'blob'})
        .then(res => URL.createObjectURL(new Blob([res.data])))
        .then(img => setFullsize(img))
    ])
      .finally(() => setLoading(false))

  }, []);

  const handleClick = () => {
    onSelect()
  }
  const handleClose = () => {
    onSelect()
  }

  return <LoadingIndicator isLoading={loading}>
    <Card onClick={handleClick} sx={{
      border: '1px solid black',
      width: '80px',
      height: '80px',
      p: '2px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    }}>
      <CardMedia component="img"
                 image={thumbnail}
                 width="64px"
                 height="64px"
                 alt={page.name}
                 sx={{objectFit: 'contain'}}
      />
    </Card>

    <Modal open={opened} onClose={handleClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        height: '95%',
        maxHeight: '95%',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 2,
        overflow: 'visible'
      }}>
        <Stack spacing={1} sx={{height: '100%'}} justifyContent='center' alignItems="center">
          <Typography>
            {page.name}
          </Typography>

          <img src={fullsize}
               alt="Lädt ..."
               style={{
                 flexGrow: 1,
                 border: '1px solid black',
                 objectFit: 'contain', objectPosition: 'center'
               }}
          />

          {navigation}
        </Stack>
      </Box>
    </Modal>
  </LoadingIndicator>
}

type Page = {
  index: number;
  name: string;
}

export default function MenuPages({restaurant}: { restaurant: Restaurant }) {
  const [currentlyOpenedIndex, setCurrentlyOpenedIndex] = useState<number | null>(null)

  const pages = useMemo(() => {
    return Array(25)
      .fill(null)
      .map((_, idx) => idx)
      .map(idx => {
        return {
          index: idx,
          name: "Seite " + (idx + 1),
        } as Page
      })

  }, [])

  const onSelect = useCallback((page: Page) => {
    setCurrentlyOpenedIndex(prev => {
      if (prev !== null && prev === page.index)
        return null;
      return page.index;
    })
  }, []);

  return <Stack spacing={1}
                justifyContent="flex-start"
                alignItems="center"
                sx={{
                  height: '45vh',
                  maxHeight: '100%',
                  width: '100%',
                  overflowY: 'auto',
                  flexGrow: 1,
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  gap: 1,
                  padding: '10px 0',
                }}>
    {
      pages.map(p => {
        return <MenuPageImage key={p.index}
                              page={p}
                              opened={currentlyOpenedIndex === p.index}
                              onSelect={() => onSelect(p)}
                              navigation={
                                <Pagination
                                  page={(currentlyOpenedIndex ?? 0) + 1}
                                  onChange={(_, newValue) => setCurrentlyOpenedIndex(newValue - 1)}
                                  count={pages.length}/>
                              }/>
      })
    }
  </Stack>
}
