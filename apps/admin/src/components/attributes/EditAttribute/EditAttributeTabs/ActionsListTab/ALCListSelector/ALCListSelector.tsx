// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Menu} from 'semantic-ui-react';

interface IALCListSelectorProps {
    changeSelectorTo: any;
    currentActionListName: any;
    connectionFailures: any;
}

function ALCListSelector({
    changeSelectorTo,
    currentActionListName,
    connectionFailures,
}: IALCListSelectorProps): JSX.Element {
    const disconnectedStyle = {
        background: '#ffcccc',
    };

    const listsWithConnectionsFailures: string[] = [];

    if (connectionFailures && connectionFailures.length) {
        connectionFailures.forEach(connectionFailure => {
            if (!listsWithConnectionsFailures.includes(connectionFailure.list)) {
                listsWithConnectionsFailures.push(connectionFailure.list);
            }
        });
    }

    const changeSelectorToSaveValue = () => {
        changeSelectorTo('saveValue');
    };

    const changeSelectorToPostSaveValue = () => {
        changeSelectorTo('postSaveValue');
    };

    const changeSelectorToGetValue = () => {
        changeSelectorTo('getValue');
    };

    const changeSelectorToDeleteValue = () => {
        changeSelectorTo('deleteValue');
    };

    const changeSelectorToPostDeleteValue = () => {
        changeSelectorTo('postDeleteValue');
    };

    return (
        <Menu pointing secondary>
            <Menu.Item
                name="saveValue"
                style={listsWithConnectionsFailures.includes('saveValue') ? disconnectedStyle : {}}
                active={currentActionListName === 'saveValue'}
                onClick={changeSelectorToSaveValue}
            />
            <Menu.Item
                name="postSaveValue"
                style={listsWithConnectionsFailures.includes('postSaveValue') ? disconnectedStyle : {}}
                active={currentActionListName === 'postSaveValue'}
                onClick={changeSelectorToPostSaveValue}
            />
            <Menu.Item
                name="getValue"
                style={listsWithConnectionsFailures.includes('getValue') ? disconnectedStyle : {}}
                active={currentActionListName === 'getValue'}
                onClick={changeSelectorToGetValue}
            />
            <Menu.Item
                name="deleteValue"
                style={listsWithConnectionsFailures.includes('deleteValue') ? disconnectedStyle : {}}
                active={currentActionListName === 'deleteValue'}
                onClick={changeSelectorToDeleteValue}
            />
            <Menu.Item
                name="postDeleteValue"
                style={listsWithConnectionsFailures.includes('postDeleteValue') ? disconnectedStyle : {}}
                active={currentActionListName === 'postDeleteValue'}
                onClick={changeSelectorToPostDeleteValue}
            />
        </Menu>
    );
}

export default ALCListSelector;
