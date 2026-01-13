import {type FunctionComponent} from 'react';
import {type LinkFieldProps} from './_types';
import {LinkFieldExplorer} from './LinkFieldExplorer';

const LinkField: FunctionComponent<LinkFieldProps> = ({
    element,
    readonly,
    isFormCreationMode,
    onDeleteMultipleValues,
    metadataEdit = false,
}) => (
    // TODO: Add <LinkFieldTag /> here later
    <LinkFieldExplorer
        element={element}
        readonly={readonly}
        isFormCreationMode={isFormCreationMode}
        onDeleteMultipleValues={onDeleteMultipleValues}
        metadataEdit={metadataEdit}
    />
);

export default LinkField;
