import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Route, Redirect } from 'react-router-dom' 

import Login from './login/Login'
import Dashboard from './logged/dashboard/Dashboard'

import Verification from './verification/Verification'

import io from "socket.io-client"
import AddUser from './logged/users-management/adduser/AddUser'

import Swal from 'sweetalert';

const ENDPOINT = "http://192.168.0.234:4001"

const socket = io(ENDPOINT);

const Client = () => {
    const infos = useSelector(state => state.authReducer)

    useEffect(() => 
    {
        socket.emit("client_handshake");

        if(infos.user !== null)
        {
            socket.on("alert",(alertMessage) => 
            {
                Swal({
                    title: "ATTENTION! DANGER DÉTECTÉ",
                    text: alertMessage,
                    icon: "warning",
                });    
            })
        }
    }, []);

    return (
        <>
            <Route path="/user">
                {
                    infos.user !== null ? 
                    <Redirect to="/dashboard" /> 
                    : 
                    <Redirect to="/login" />
                }
            </Route>
            <Route path="/login" component={() => <Login socket={socket} info={infos.user}/>} />
            <Route path="/dashboard" component={() => <Dashboard socket={socket} />} />
            <Route path="/dashboard/user/add" component={() => <AddUser socket={socket} />}/>
            <Route path="/verification/email/:verkey" component={() => <Verification socket={socket} type="email" />}/>
            <Route path="/verification/phone/:verkey" component={() => <Verification socket={socket} type="pnum" />}/>
        </>
    );
}

export default Client;