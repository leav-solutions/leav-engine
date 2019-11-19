import React from 'react';
// import styled from 'styled-components';
import {Menu} from 'semantic-ui-react';

interface IALCListSelectorProps {
    changeSelectorTo: any;
    currentActionListName: any;
    connectionFailures: any;
}

function ALCListSelector({
    changeSelectorTo,
    currentActionListName,
    connectionFailures
}: IALCListSelectorProps): JSX.Element {
    const disconnectedStyle = {
        background: '#ffcccc'
    };

    const listsWithConnectionsFailures: string[] = [];

    if (connectionFailures && connectionFailures.length) {
        connectionFailures.forEach(connectionFailure => {
            if (!listsWithConnectionsFailures.includes(connectionFailure.list)) {
                listsWithConnectionsFailures.push(connectionFailure.list);
            }
        });
    }

    // function handleCkick(e) {
    //   return function doChangeSelectorTo(listName) {
    //     changeSelectorTo(listName)
    //   }
    // }


    return (
        <Menu pointing secondary>
            <Menu.Item
                name="saveValue"
                style={listsWithConnectionsFailures.includes('saveValue') ? disconnectedStyle : {}}
                active={currentActionListName === 'saveValue'}
                onClick={() => changeSelectorTo('saveValue')}
            />
            <Menu.Item
                name="getValue"
                style={listsWithConnectionsFailures.includes('getValue') ? disconnectedStyle : {}}
                active={currentActionListName === 'getValue'}
                onClick={() => changeSelectorTo('getValue')}
            />
            <Menu.Item
                name="deleteValue"
                style={listsWithConnectionsFailures.includes('deleteValue') ? disconnectedStyle : {}}
                active={currentActionListName === 'deleteValue'}
                onClick={() => changeSelectorTo('deleteValue')}
            />
        </Menu>
    );
}

export default ALCListSelector;
