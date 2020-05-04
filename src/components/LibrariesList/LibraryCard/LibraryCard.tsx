import React from 'react';
import {useHistory} from 'react-router-dom';
import {Button, Card} from 'semantic-ui-react';
import {ILibrary} from '../../../_types/types';

interface ILibraryCardProps {
    lib: ILibrary;
    changeLibSelected: (libSelected: any) => void;
}

function LibraryCard({lib, changeLibSelected}: ILibraryCardProps): JSX.Element {
    const history = useHistory();

    const goDetail = () => {
        const detailUrl = `/library/list/${lib.id}/${lib.gqlNames.query}`;
        history.push(detailUrl);
    };

    const handleChangeLibSelected = () => {
        changeLibSelected({id: lib.id, query: lib.gqlNames.query});
    };

    return (
        <Card key={lib.id}>
            <Card.Content>
                <Card.Header as="h3">{lib.label.en ?? lib.id}</Card.Header>
                <Card.Meta>{lib.id}</Card.Meta>

                <Card.Description>
                    <Button.Group fluid>
                        <Button icon="share" />
                        <Button icon="external share" onClick={goDetail} />
                        <Button icon="like" />
                        <Button icon="configure" />
                        <Button icon="info" onClick={handleChangeLibSelected} />
                    </Button.Group>
                </Card.Description>
            </Card.Content>
        </Card>
    );
}

export default LibraryCard;
