import React from 'react';
import EntityPreviewList from './EntityPreviewList';
import EntityPreviewTile from './EntityPreviewTile';
import {type IEntityPreviewProps} from './_types';

const comp = React.memo(function EntityPreview(props: IEntityPreviewProps): JSX.Element {
    if (props.tile) {
        return <EntityPreviewTile {...props} />;
    }

    return <EntityPreviewList {...props} />;
});

export default comp;
