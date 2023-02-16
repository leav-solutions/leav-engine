import { jsx as _jsx } from "react/jsx-runtime";
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import RecordPreviewList from './RecordPreviewList';
import RecordPreviewTile from './RecordPreviewTile';
function RecordPreview(props) {
    if (props.tile) {
        return _jsx(RecordPreviewTile, Object.assign({}, props));
    }
    return _jsx(RecordPreviewList, Object.assign({}, props));
}
export default React.memo(RecordPreview);
//# sourceMappingURL=RecordPreview.js.map