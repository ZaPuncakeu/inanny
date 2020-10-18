import React, {useState} from 'react'
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom' 

import Presentation from './components/presentation/Presentation'
import Client from './components/client-area/Client'

function App() 
{
    return(
        <>
            <Router>
                <Switch>
                    <Route path="/" exact component={Presentation} />
                    <Client />
                </Switch>
            </Router>
        </>
    )
}

export default App;