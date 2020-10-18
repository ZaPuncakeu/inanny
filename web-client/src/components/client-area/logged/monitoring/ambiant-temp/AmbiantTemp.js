import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
    BarChart,
    Bar, 
    Line, 
    LineChart, 
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from 'recharts';

import './AmbiantTemp.css'

const AmbiantTemp = ({atmp}) => 
{
    const infos = useSelector(state => state.authReducer)
    const [data, setData] = useState([]);

    useEffect(()=>
    {
        setData([...data, atmp]);
    }, [atmp]);

    return(
        <div className="atemp">
            <LineChart width={900} height={600} data={data.slice(0).slice(-10)}>
                <XAxis dataKey="date" />
                <YAxis />
                <Line isAnimationActive={false} type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
        </div>
    )
}

export default AmbiantTemp;