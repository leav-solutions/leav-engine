// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import RecordPreviewList from './RecordPreviewList';
import RecordPreviewTile from './RecordPreviewTile';
import {IRecordPreviewProps} from './_types';

function RecordPreview(props: IRecordPreviewProps): JSX.Element {
    if (props.tile) {
        return <RecordPreviewTile {...props} />;
    }

    return <RecordPreviewList {...props} />;
}

export default React.memo(RecordPreview);
