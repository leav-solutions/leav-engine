import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import {Button, Card} from 'semantic-ui-react';
import styled, {CSSObject} from 'styled-components';
import {ILibrary} from '../../../_types/types';

interface ILibraryCardProps {
    lib: ILibrary;
}

interface IActionsWrapperProps {
    display: boolean;
    style?: CSSObject;
}

const ActionsWrapper = styled.div<IActionsWrapperProps>`
    opacity: ${({display}) => (display ? 1 : 0)};
`;

function LibraryCard({lib}: ILibraryCardProps): JSX.Element {
    const history = useHistory();
    const [showActions, setShowActions] = useState<boolean>(false);

    const goDetail = () => {
        const detailUrl = `/library/detail/${lib.id}/${lib.gqlNames.query}`;
        history.push(detailUrl);
    };

    const handleChangeLibSelected = () => {
        history.push(`/library/list/${lib.id}/${lib.gqlNames.query}`);
    };

    const displayActions = () => setShowActions(true);
    const hideActions = () => setShowActions(false);

    return (
        <Card key={lib.id} as="div" onMouseEnter={displayActions} onMouseLeave={hideActions}>
            <Card.Content>
                <Card.Header as="h3">{lib.label.en ?? lib.id}</Card.Header>
                <Card.Meta>{lib.id}</Card.Meta>

                <Card.Description>
                    <ActionsWrapper display={showActions}>
                        <Button.Group fluid>
                            <Button icon="share" />
                            <Button icon="external share" onClick={goDetail} />
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
