import React, {useState, useEffect} from 'react'
import { useDispatch } from 'react-redux'
import {usePath} from 'hookrouter'
import { Link } from 'react-router-dom'
import { LOGOUT } from '../../../../auth/authActions'


import './Menu.css'

const Menu = ({isAdmin, fname, lname}) => {
    const [menuOn, setMenuOn] = useState(false);
    const mediaMatch = window.matchMedia("(max-width: 900px)");
    const [isMobile, setIsMobile] = useState(mediaMatch.matches);
    const dispatch = useDispatch();
    const [path, setPath] = useState(window.location.pathname);

    const navs = [{
        link: '/dashboard',
        icon: 'fa fa-eye',
        content: "Surveillance",
        admin: false,
    },
    {
        link: '/dashboard/profile',
        icon: 'fa fa-user',
        content: "Profil",
        admin: false,
    },
    {
        link: '/dashboard/users',
        icon: 'fa fa-users',
        content: "Liste des utilisateurs",
        admin: true,
    },
    {
        link: '/dashboard/objects',
        icon: 'fa fa-microchip',
        content: "Liste des objets",
        admin: true,
    }]

    useEffect(() => 
    {
        window.addEventListener('resize', () => 
        {
            if (window.matchMedia("(max-width: 900px)").matches !== isMobile) 
            {
                setIsMobile(!isMobile);
            }
        });
    });

    return(
        <>
        

            {
                isMobile && 
                <div className="menu-header">
                    <button 
                        className="fa fa-bars menu-burger"
                        onClick={() => setMenuOn(true)}
                    >
                    </button>
                </div>
            }

            {
                (menuOn || !isMobile) && 
                <div 
                    className={"menu-container " + (isMobile?"m-has-bg":"")}
                    onClick={() => (isMobile && menuOn) && setMenuOn(false)}
                >
                    <div className="menu">
                        <div className="menu-u">
                            <br />
                            <br />
                            <h1>
                                {fname}
                            </h1>
                            <h1>
                                {lname}
                            </h1>
                            {
                                isAdmin && 
                                <p>Administrateur</p>
                            }
                        </div>

                        <div className="menu-m">
                            {
                                navs.map((nav) => {
                                    return(
                                        (isAdmin || !nav.admin) ? 
                                            (path !== nav.link) ? 
                                            <Link to={nav.link}>
                                                <button onClick={() =>{
                                                    setPath(nav.link);
                                                }}>
                                                    <i className={nav.icon}></i>
                                                    &nbsp; &nbsp;
                                                    {nav.content}
                                                </button>
                                            </Link>
                                            :
                                            <button 
                                                style={{
                                                    backgroundColor:'rgb(54, 105, 167)'
                                                }}
                                            >
                                                <i className={nav.icon}></i>
                                                &nbsp; &nbsp;
                                                {nav.content}
                                            </button>
                                        :
                                        ""
                                    )
                                })
                            }
                        </div>
                        
                        <div className="menu-d">
                            <button onClick={() =>
                            { 
                                dispatch({type: LOGOUT})
                                window.location.href = "/user"
                            }}>
                                <i className="fa fa-sign-out"></i>
                                &nbsp; 
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default Menu;