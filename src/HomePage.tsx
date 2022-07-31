import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import IHttpClient from './http/IHttpClient';
import HttpClient from './http/HttpClient';
import { Button, Chip, CircularProgress, Divider, Grid, IconButton, TextField } from '@mui/material';
import SearchMeli, { ISearchResult } from './search';
import SellerResultsLists from './SellersResultsList';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import SelectRegion from './SelectRegion';

interface IPlaceHolder { };
interface IState { 
  client: IHttpClient;
  items: string[];
  searchResults: ISearchResult[] | null;
  searching: boolean;
  region: string;
};

export default class HomePage extends React.Component<IPlaceHolder, IState> {
  state: IState = {
    client: new HttpClient("https://api.mercadolibre.com/sites/MLA"),
    items: [""],
    searchResults: null,
    searching: false,
    region: "MLA"
  }

  constructor(p: any) {
    super(p);
    this.addItem = this.addItem.bind(this);
    this.changeItem = this.changeItem.bind(this);
    this.search = this.search.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.onChangeRegion = this.onChangeRegion.bind(this);
  }
  
  addItem() {
    this.setState(prevState => ({ items: prevState.items.concat([""]) }));
  }

  changeItem(index: number, text:string) {
    this.setState(prevstate => {
      let items = prevstate.items;
      items[index] = text;
      return { items };
    });
  }  

  async search() {
    const items = this.state.items.filter(v => v.length > 0);

    // visually delete them
    this.state.items.forEach((v, i) => {
      if (v.length === 0) this.deleteItem(i);
    });

    // search
    this.setState(({ searching: true, searchResults: null }));
    const results = await SearchMeli(items, this.state.client, 100);
    this.setState(({ searchResults: results, searching: false }));
  }

  deleteItem(index: number) {
    this.setState(prev => ({ items: prev.items.filter((_, i) => i !== index) }));
  }

  onChangeRegion(regionID: string) {
    this.setState(({
      region: regionID,
      client: new HttpClient("https://api.mercadolibre.com/sites/" + regionID)
    }));
  }

  render() {
    return (
      <Box sx={{ marginLeft: "15px", marginRight: "15px" }}>
        
        <Stack direction="row" justifyContent="space-around" style={{ margin: "15px" }}>
          <SelectRegion callbackChange={this.onChangeRegion} region={ this.state.region} />
          <Button variant="outlined" startIcon={<AddIcon />} onClick={this.addItem} >Agregar item</Button>        
          <Button variant="contained" startIcon={<SearchIcon />} color="primary" onClick={this.search}>Buscar</Button>
        </Stack>

        <Divider>
          <Chip label="Items" />
        </Divider>

        <Stack direction="column" spacing={2}>
          {
            this.state.items.map((item, i) => (
              <Grid key={i} container spacing={2} sx={{margin: 0, alignItems: "center"}}>
                <Grid item xs={11}>
                  <TextField                    
                    fullWidth
                    label="item"
                    id="txt-{i}"
                    defaultValue={item}
                    onChange={e => this.changeItem(i, e.target.value)}
                    />
                </Grid>

                <Grid item xs={1}>
                  <IconButton aria-label="delete" color="primary" onClick={() => this.deleteItem(i)}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            )
            )
          }
        </Stack>

        <Divider sx={{ marginTop: "15px" }}>
          <Chip label="Resultados" />
        </Divider>

        <div style={{ marginTop: "15px" }}>
          { this.state.searchResults != null &&
            <SellerResultsLists client={this.state.client} region={this.state.region} sellers={this.state.searchResults} />
          }
          {this.state.searchResults === null && this.state.searching && 
            <CircularProgress sx={{ right: "50%", position: "absolute" }} />
          }
        </div>
      </Box>
    );
  }
}