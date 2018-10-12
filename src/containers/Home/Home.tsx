import * as React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import Attributes from '../Attributes';
import EditAttribute from '../EditAttribute';
import EditLibrary from '../EditLibrary';
import Libraries from '../Libraries';
import MainMenu from '../MainMenu';
import Trees from '../Trees';

function Home(): JSX.Element {
    return (
        <Router>
            <div className="wrapper">
                <div
                    className="left"
                    style={{position: 'fixed', width: '250px', height: '100%', backgroundColor: '#1b1c1d'}}
                >
                    <MainMenu />
                </div>
                <div className="content" style={{marginLeft: 250, padding: 20}}>
                    <Route path="/libraries" component={Libraries} exact />
                    <Route path="/libraries/edit/:id?" component={EditLibrary} exact />
                    <Route path="/attributes" component={Attributes} exact />
                    <Route path="/attributes/edit/:id?" component={EditAttribute} exact />
                    <Route path="/trees" component={Trees} exact />
                </div>
            </div>
        </Router>
    );
}

export default Home;
