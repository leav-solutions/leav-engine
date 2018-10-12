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
                    <Route path="/libraries" component={Libraries} />
                    <Route path="/attributes" component={Attributes} />
                    <Route path="/trees" component={Trees} />
                    <Route path="/edit-library/:id?" component={EditLibrary} />
                    <Route path="/edit-attribute/:id?" component={EditAttribute} />
                </div>
            </div>
        </Router>
    );
}

export default Home;
