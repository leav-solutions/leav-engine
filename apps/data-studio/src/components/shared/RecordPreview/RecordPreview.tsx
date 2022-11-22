// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import RecordPreviewList from './RecordPreviewList';
import RecordPreviewTile from './RecordPreviewTile';
import {IRecordPreviewProps} from './_types';

function RecordPreview({label, color, image, style, tile, size, simplistic}: IRecordPreviewProps): JSX.Element {
    if (tile) {
        return RecordPreviewTile({label, color, image, size, style, simplistic});
    }

    return RecordPreviewList({label, color, image, size, style, simplistic});
}

export default React.memo(RecordPreview);
