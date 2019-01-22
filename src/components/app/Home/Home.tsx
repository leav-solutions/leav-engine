import * as React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import Attributes from 'src/components/attributes/Attributes';
import EditAttribute from 'src/components/attributes/EditAttribute';
import EditLibrary from 'src/components/libraries/EditLibrary';
import Libraries from 'src/components/libraries/Libraries';
import EditTree from 'src/components/trees/EditTree';
import Trees from 'src/components/trees/Trees';
import MainMenu from '../MainMenu';
function Home(): JSX.Element {
    return (
        <Router>
            <div className="wrapper height100">
                <div
                    className="left flex-col"
                    style={{
                        position: 'fixed',
                        width: '250px',
                        backgroundColor: '#1b1c1d',
                        minHeight: '100vh'
                    }}
                >
                    <MainMenu />
                </div>
                <div className="content flex-col height100" style={{marginLeft: 250, padding: 20, minHeight: '100vh'}}>
                    <Route path="/libraries" component={Libraries} exact />
                    <Route path="/libraries/edit/:id?" component={EditLibrary} exact />
                    <Route path="/attributes" component={Attributes} exact />
                    <Route path="/attributes/edit/:id?" component={EditAttribute} exact />
                    <Route path="/trees" component={Trees} exact />
                    <Route path="/trees/edit/:id?" component={EditTree} exact />
                </div>
            </div>
        </Router>
    );
}

export default Home;
