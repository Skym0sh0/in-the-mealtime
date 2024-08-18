import {
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

export default function ReportView({report}: { report: RestaurantReport }) {
  return <SPaper>
    <Stack direction="column" spacing={1}>
      <Typography variant="h5">
        Statistiken
      </Typography>

      <Stack direction="row" spacing={4} justifyContent="space-between">
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
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
                <TableCell>Essen</TableCell>
                <TableCell>{report.countOfOrderedMeals}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Gesamtsumme</TableCell>
                <TableCell>{formatMonetaryAmount(report.overallPrice)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Trinkgeld</TableCell>
                <TableCell>{formatMonetaryAmount(report.overallTip)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <TopRanking title="Teilnehmer" top={report.topParticipants}/>
        <TopRanking title="Anrufer" top={report.topOrderers}/>
        <TopRanking title="Abholer" top={report.topFetchers}/>
        <TopRanking title="Geldsammler" top={report.topMoneyCollectors}/>
      </Stack>
    </Stack>
  </SPaper>
}

function TopRanking({title, top}: { title: string, top?: StatisticPerson[], }) {
  return <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Top {title}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Anzahl</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {top?.map(p => {
          return <TableRow key={p.name}>
            <TableCell>{p.name}</TableCell>
            <TableCell>{p.count}</TableCell>
          </TableRow>
        })}
      </TableBody>
    </Table>
  </TableContainer>
}

const SPaper = styled(Paper)`
    width: 100%;
    padding: 1em;
`;