import {ReactNode, useCallback, useEffect, useState} from "react";
import {Box, Card, CardMedia, Modal, Pagination, Stack, Typography} from "@mui/material";
import LoadingIndicator from "../../../utils/LoadingIndicator.tsx";
import {MenuPage, Restaurant} from "../../../../build/generated-ts/api";
import {useApiAccess} from "../../../utils/ApiAccessContext.tsx";

type MenuPageImageProps = {
  page: MenuPage,
  restaurant: Restaurant,
  opened: boolean,
  navigation: ReactNode,
  onSelect: () => void,
};

function MenuPageImage({restaurant, page, opened, onSelect, navigation}: MenuPageImageProps) {
  const {restaurantApi} = useApiAccess();

  const [loading, setLoading] = useState(false)
  const [fullsize, setFullsize] = useState<string>('')

  useEffect(() => {
    setLoading(true)

    let tmp: string;

    Promise.all([
      restaurantApi.fetchRestaurantsMenuPage(restaurant.id, page.id, undefined, {responseType: 'blob'})
        .then(res => URL.createObjectURL(new Blob([res.data])))
        .then(img => {
          tmp = img;
          setFullsize(img);
        })
    ])
      .finally(() => setLoading(false))

    return () => {
      if (tmp) {
        URL.revokeObjectURL(tmp)
      }
    }
  }, [page.id, restaurant.id, restaurantApi]);

  const handleClick = () => {
    onSelect()
  }
  const handleClose = () => {
    onSelect()
  }

  return <LoadingIndicator isLoading={loading}>
    <Card onClick={handleClick} sx={{
      border: '1px solid black',
      width: '120px',
      height: '80px',
      p: '1em',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
      ':hover': {
        cursor: 'pointer',
      },
    }}>
      <CardMedia component="img"
                 image={fullsize}
                 width="64px"
                 height="64px"
                 alt={page.name}
                 sx={{objectFit: 'contain'}}
      />
    </Card>

    <Modal open={opened} onClose={handleClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80vw',
        height: '80vh',
        backgroundColor: 'background.paper',
        borderRadius: '1em',
        boxShadow: 24,
        p: 2,
      }}>
        <Stack spacing={1} sx={{height: '100%'}} justifyContent='center' alignItems="center">
          <Typography>
            {page.name}
          </Typography>

          <div style={{width: '100%', height: '100%', overflow: 'hidden'}}>
            <img src={fullsize}
                 alt="Lädt ..."
                 style={{
                   width: '100%', height: '100%',
                   display: 'block',
                   flexGrow: 1,
                   border: '1px solid black',
                   objectFit: 'contain',
                   objectPosition: 'center'
                 }}
            />
          </div>

          {navigation}
        </Stack>
      </Box>
    </Modal>
  </LoadingIndicator>
}

export default function MenuPages({height, restaurant}: { height?: string, restaurant: Restaurant }) {
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
                  height: height,
                  maxHeight: height,
                  width: '100%',
                  overflowY: 'auto',
                  padding: '1em',
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
