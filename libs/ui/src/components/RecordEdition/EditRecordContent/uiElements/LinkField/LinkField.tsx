// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FunctionComponent} from 'react';
import {type LinkFieldProps} from './_types';
import {LinkFieldExplorer} from './explorer/LinkFieldExplorer';
import {LinkFieldTags} from './tag/LinkFieldTags';
import {DisplayMode} from '@leav/utils';

const LinkField: FunctionComponent<LinkFieldProps> = ({
    element,
    readonly,
    isFormCreationMode,
    onValueSubmit,
    onValueDelete,
    onDeleteMultipleValues,
    metadataEdit = false,
}) => {
    if (element.settings.displayMode === DisplayMode.TAG) {
        return (
            <LinkFieldTags
                element={element}
                readonly={readonly}
                isFormCreationMode={isFormCreationMode}
                onValueSubmit={onValueSubmit}
                onValueDelete={onValueDelete}
                onDeleteMultipleValues={onDeleteMultipleValues}
                metadataEdit={metadataEdit}
            />
        );
    }

    return (
        <LinkFieldExplorer
            element={element}
            readonly={readonly}
            isFormCreationMode={isFormCreationMode}
            onDeleteMultipleValues={onDeleteMultipleValues}
            metadataEdit={metadataEdit}
        />
    );
};

export default LinkField;
