import React, {useState, useEffect} from 'react';
import {useHistory, Switch, Route, Redirect} from 'react-router-dom';
import {useSelector} from 'react-redux';

import Menu from '../menu/Menu';
import PageLoader from '../page-loader/PageLoader';
import Monitoring from '../monitoring/Monitoring'
import ObjManagement from '../object-management/ObjManagement'

import './Dashboard.css'
import UserManagement from '../users-management/UserManagement';
import ProfileManagement from '../profile-management/ProfileManagement'

const Dashboard = ({socket}) => {
    
    const [user, setUser] = useState(null);
    const [hideLoader, setHideLoader] = useState(false);
    const history = useHistory();
    let infos = useSelector(state => state.authReducer).user;
    
    useEffect(() => 
    {
        if(infos === null)
        {
            history.push("/user");
        }
    }, [])

    useEffect(() => 
    {
        if(infos !== null)
        {
            socket.emit("get_user_req", infos);
            socket.on("get_user_res", (user) => 
            {
                setUser(user);
                setHideLoader(true);
            });
        }
    }, [socket, infos]);

    return(
        <>
            <PageLoader hide={hideLoader} />
            {
                user !== null && 
                <Menu isAdmin={user.isAdmin} fname={user.fname} lname={user.lname} />
            }
            
            <div className="page-content">
                {infos === null ? <Redirect to="/user"/> : <Monitoring socket={socket} />}
                <Route path="/dashboard/objects" component={() => <ObjManagement socket={socket} />} />
                <Route path="/dashboard/users" component={() => <UserManagement socket={socket} setHideLoader={setHideLoader} hideLoader={hideLoader} /> } />
                {
                    user &&
                    <Route path="/dashboard/profile" component={() => <ProfileManagement socket={socket} userInfos={user} /> } />
                }
            </div>
        </>
    )
}

export default Dashboard;