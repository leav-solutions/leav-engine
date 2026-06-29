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
