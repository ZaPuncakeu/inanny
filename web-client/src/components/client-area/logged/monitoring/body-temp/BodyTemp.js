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

import './BodyTemp.css'

const BodyTemp = ({btmp}) => 
{
    const infos = useSelector(state => state.authReducer)
    const [data, setData] = useState([]);

    useEffect(()=>
    {
        setData([...data,btmp]);
    }, [btmp]);

    return(
        <div className="btemp">
            <LineChart width={900} height={600} data={data.slice(0).slice(-10)}>
                <XAxis dataKey="date" />
                <YAxis />
                <Line isAnimationActive={false} type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
        </div>
    )
}

export default BodyTemp;