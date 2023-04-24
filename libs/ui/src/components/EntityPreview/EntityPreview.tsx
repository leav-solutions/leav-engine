// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import EntityPreviewList from './EntityPreviewList';
import EntityPreviewTile from './EntityPreviewTile';
import {IEntityPreviewProps} from './_types';

function EntityPreview(props: IEntityPreviewProps): JSX.Element {
    if (props.tile) {
        return <EntityPreviewTile {...props} />;
    }

    return <EntityPreviewList {...props} />;
}

export default React.memo(EntityPreview);
