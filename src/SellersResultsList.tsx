import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { useEffect, useState } from "react";
import IHttpClient from "./http/IHttpClient";
import { ISearchResult } from "./search";

interface IProps {
    client: IHttpClient;
    sellers: ISearchResult[];
    region: string;
}


export default function SellerResultsLists(props: IProps) {
    const l_sorted = props.sellers.sort((a, b) => b.items_found.length - a.items_found.length);
    
    const [tld, setTLD] = useState<string>(".com.ar");
    
    const getLink = (id: any) => (<a href={`https://listado.mercadolibre${tld}/_CustId_${id}`} >link</a >);

    useEffect(() => {
        // Get the TLD for the region, e.g. .com.ar, .com.mx, .gt, ...
        // to then use it in the links that redirects the user to the seller listing page
        props.client.get("/search", { q: "ar", limit: 1 })
            .then(r => r.json())
            .then(res => {
                if (res.results.length !== 0) {
                    const example_link = res.results[0].permalink;
                    const url = new URL(example_link);
                    const extracted = url.hostname.replace("mercadolibre", "").split(/\./).slice(-2).join('.');                    
                    setTLD(extracted.startsWith(".") ? extracted : "." + extracted);
                } else {
                    console.error("#0003");
                }
            });
    }, [props.client, props.region]);

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Vendedor ID</TableCell>
                        <TableCell align="right">Tiene todo los items?</TableCell>
                        <TableCell align="right">Items encontrados</TableCell>
                        <TableCell align="right">Link</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {l_sorted.map((row) => (
                        <TableRow
                            key={row.seller_id}
                            sx={{
                                '&:last-child td, &:last-child th': { border: 0 },
                                backgroundColor: row.has_all ? "#36ff044f"  : ""
                            }}
                        >
                            <TableCell component="th" scope="row">
                                {row.seller_id}
                            </TableCell>
                            <TableCell align="right">{row.has_all ? "si" : "no"}</TableCell>
                            <TableCell align="right">{row.items_found.join(", ")}</TableCell>
                            <TableCell align="right">{getLink(row.seller_id)}</TableCell>                            
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>);
}