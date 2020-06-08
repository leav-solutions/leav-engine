import {useQuery} from '@apollo/client';
import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {Button, Card} from 'semantic-ui-react';
import styled, {CSSObject} from 'styled-components';
import {getActiveLibrary} from '../../../queries/cache/activeLibrary/getActiveLibraryQuery';
import {getLang} from '../../../queries/cache/lang/getLangQuery';
import {localizedLabel} from '../../../utils';
import {ILibrary} from '../../../_types/types';

interface ILibraryCardProps {
    lib: ILibrary;
}

interface IActionsWrapperProps {
    showActions?: boolean;
    style?: CSSObject;
}

const ActionsWrapper = styled.div<IActionsWrapperProps>`
    opacity: ${({showActions}) => (showActions ? 1 : 0)};
`;

function LibraryCard({lib}: ILibraryCardProps): JSX.Element {
    const history = useHistory();
    const [showActions, setShowActions] = useState<boolean>(false);

    const goLib = () => {
        const detailUrl = `/library/items/${lib.id}/${lib.gqlNames.query}`;
        changeActiveLibrary(lib);
        history.push(detailUrl);
    };

    const handleChangeLibSelected = () => {
        history.push(`/library/list/${lib.id}/${lib.gqlNames.query}`);
    };

    const displayActions = () => setShowActions(true);
    const hideActions = () => setShowActions(false);

    const {data: dataLang, client} = useQuery(getLang);

    // handle case dataLang is null
    const {lang} = dataLang ?? {lang: []};

    const changeActiveLibrary = (lib: ILibrary) => {
        client.writeQuery({
            query: getActiveLibrary,
            data: {
                activeLibId: lib.id,
                activeLibQueryName: lib.gqlNames.query,
                activeLibName: localizedLabel(lib.label, lang)
            }
        });
    };

    return (
        <Card key={lib.id} as="div" onMouseEnter={displayActions} onMouseLeave={hideActions}>
            <Card.Content>
                <Card.Header as="h3">{localizedLabel(lib.label, lang) ?? lib.id}</Card.Header>
                <Card.Meta>{lib.id}</Card.Meta>

                <Card.Description>
                    <ActionsWrapper showActions={showActions}>
                        <Button.Group fluid>
                            <Button icon="share" onClick={goLib} />
                            <Button icon="external share" />
                            <Button icon="like" />
                            <Button icon="configure" />
                            <Button icon="info" onClick={handleChangeLibSelected} />
                        </Button.Group>
                    </ActionsWrapper>
                </Card.Description>
            </Card.Content>
        </Card>
    );
}

export default LibraryCard;
