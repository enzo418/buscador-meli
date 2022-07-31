import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import React, {useEffect, useState} from 'react';
import HttpClient from './http/HttpClient';

interface IProps {
    callbackChange: (value: string) => any;
    region: string;
}

interface IRegion {
    id: string;
    name: string;
}

export default function SelectRegion(props: IProps) {
    const [regions, setRegions] = useState<IRegion[]>([]);

    useEffect(() => {
        const client = new HttpClient();

        client.get("https://api.mercadolibre.com/sites")
            .then(r => r.json())
            .then(regions => setRegions(regions.map((r:any) => ({ id: r.id, name: r.name }))));
    }, []);

    const onChangeRegion = (e:any) => {
        props.callbackChange(e.target.value as string);
    }

    return (<FormControl>
        <InputLabel id="select-region">Region</InputLabel>
        <Select
            labelId="select-region"
            id="demo-simple-select"
            value={props.region}
            label="Region"
            onChange={onChangeRegion}
        >
            {regions.map((r) => (<MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>))}
        </Select>
    </FormControl>);
}