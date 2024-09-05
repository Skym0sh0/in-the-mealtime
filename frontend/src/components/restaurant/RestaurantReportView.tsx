import {
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import {formatMonetaryAmount} from "../../utils/moneyUtils.ts";
import {RestaurantReport, StatisticPerson} from "../../../build/generated-ts/api/api.ts";
import styled from "styled-components";
import {useMemo, useState} from "react";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function ReportView({report}: { report: RestaurantReport }) {
  return <SPaper>
    <Stack>
      <Typography variant="h5">
        Statistiken
      </Typography>

      <Stack direction="row" spacing={4} justifyContent="space-between">
        <BaseReport report={report}/>
        <TopRanking title="Teilnehmer" top={report.topParticipants}/>
        <TopRanking title="Essen" top={report.topMeals}/>
        <TopRanking title="Anrufer" top={report.topOrderers}/>
        <TopRanking title="Abholer" top={report.topFetchers}/>
        <TopRanking title="Geldsammler" top={report.topMoneyCollectors}/>
      </Stack>
    </Stack>
  </SPaper>
}

function BaseReport({report}: { report: RestaurantReport }) {
  return <TableContainer component={Paper}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell colSpan={2}>
            Übersicht
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Was?</TableCell>
          <TableCell>Gesamt</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Bestellungen</TableCell>
          <TableCell>{report.countOfOrders}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Gerichte</TableCell>
          <TableCell>{report.countOfOrderedMeals}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Gesamtsumme</TableCell>
          <TableCell align="right">{formatMonetaryAmount(report.overallPrice)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Tips</TableCell>
          <TableCell align="right">{formatMonetaryAmount(report.overallTip)}</TableCell>
        </TableRow>

        <TableRow>
          <TableCell>&#x00D8; Gerichte pro Bestellung</TableCell>
          <TableCell align="right">{Math.round(report.countOfOrderedMeals / report.countOfOrders)}</TableCell>
        </TableRow>

        <TableRow>
          <TableCell>&#x00D8; Preis pro Bestellung</TableCell>
          <TableCell align="right">{formatMonetaryAmount(report.overallPrice / report.countOfOrders)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>&#x00D8; Tip pro Bestellung</TableCell>
          <TableCell align="right">{formatMonetaryAmount(report.overallTip / report.countOfOrders)}</TableCell>
        </TableRow>

        <TableRow>
          <TableCell>&#x00D8; Preis pro Gericht</TableCell>
          <TableCell align="right">{formatMonetaryAmount(report.overallPrice / report.countOfOrderedMeals)}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>&#x00D8; Tip pro Gericht</TableCell>
          <TableCell align="right">{formatMonetaryAmount(report.overallTip / report.countOfOrderedMeals)}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </TableContainer>
}

function TopRanking({title, top}: { title: string, top?: StatisticPerson[], }) {
  const [expanded, setExpanded] = useState(false);

  const maxRows = 8;

  const isExpandable = (top?.length ?? 0) > maxRows;

  const rows = useMemo(() => {
    return (top ?? []).filter((_, idx) => expanded ? true : idx < maxRows)
  }, [expanded, top]);

  return <TableContainer component={Paper}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell colSpan={2}>Top {title}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Anzahl</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map(p => {
          return <TableRow key={p.name}>
            <TableCell>{p.name}</TableCell>
            <TableCell>{p.count}</TableCell>
          </TableRow>
        })}

        {isExpandable &&
          <TableRow>
            <TableCell colSpan={2}>
              <IconButton onClick={() => setExpanded(prev => !prev)}
                          size="small"
                          color="info">
                {expanded
                  ? <ExpandLessIcon fontSize="inherit"/>
                  : <ExpandMoreIcon fontSize="inherit"/>
                }
              </IconButton>
            </TableCell>
          </TableRow>
        }
      </TableBody>
    </Table>
  </TableContainer>
}

const SPaper = styled(Paper)`
    width: 100%;
    padding: 1em;
`;