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

import './Camera.css'

const Camera = ({cam}) => 
{
    const infos = useSelector(state => state.authReducer)
    console.log(cam);
    return(
        <div className="cam">
            {
                (cam.data !== 0) && cam.isActive ?
                <img src={cam.data}/>
                :
                <div className="cam-off">
                    <h1>La caméra n'est pas en marche.</h1>
                </div>
            }
        </div>
    )
}

export default Camera;