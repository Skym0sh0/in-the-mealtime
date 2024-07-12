import {ReactNode, useCallback, useEffect, useState} from "react";
import {Box, Card, CardMedia, Modal, Pagination, Stack, Typography} from "@mui/material";
import {api} from "../../api/api.ts";
import LoadingIndicator from "../../utils/LoadingIndicator.tsx";
import {MenuPage, Restaurant} from "../../../build/generated-ts/api";

type MenuPageImageProps = {
  page: MenuPage,
  restaurant: Restaurant,
  opened: boolean,
  navigation: ReactNode,
  onSelect: () => void,
};

function MenuPageImage({restaurant, page, opened, onSelect, navigation}: MenuPageImageProps) {
  const [loading, setLoading] = useState(false)
  const [thumbnail, setThumbnail] = useState<string>('')
  const [fullsize, setFullsize] = useState<string>('')

  useEffect(() => {
    setLoading(true)

    Promise.all([
      api.restaurants.fetchRestaurantsMenuPage(restaurant.id, page.id, true, {responseType: 'blob'})
        .then(res => URL.createObjectURL(new Blob([res.data])))
        .then(img => setThumbnail(img)),
      api.restaurants.fetchRestaurantsMenuPage(restaurant.id, page.id, false, {responseType: 'blob'})
        .then(res => URL.createObjectURL(new Blob([res.data])))
        .then(img => setFullsize(img))
    ])
      .finally(() => setLoading(false))

    return () => {
      if (thumbnail)
        URL.revokeObjectURL(thumbnail)
      if (fullsize)
        URL.revokeObjectURL(fullsize)
    }
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

export default function MenuPages({restaurant}: { restaurant: Restaurant }) {
  const [currentlyOpenedIndex, setCurrentlyOpenedIndex] = useState<number | null>(null)

  const pages: MenuPage[] = restaurant.menuPages ?? [];

  const onSelect = useCallback((page: MenuPage) => {
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
                              restaurant={restaurant}
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