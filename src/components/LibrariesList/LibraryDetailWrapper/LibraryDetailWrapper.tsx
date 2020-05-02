import React from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {Button} from 'semantic-ui-react';
import LibraryDetail from '../LibraryDetail/LibraryDetail';

function LibraryDetailWrapper(): JSX.Element {
    const {libId, libQueryName} = useParams();
    const history = useHistory();

    const goBack = () => {
        history.goBack();
    };

    return (
        <>
            <Button icon="arrow left" onClick={goBack} />
            <LibraryDetail libId={libId ?? ''} libQueryName={libQueryName ?? ''} />
        </>
    );
}

export default LibraryDetailWrapper;
