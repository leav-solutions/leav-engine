// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {Icon, SemanticICONS} from 'semantic-ui-react';
import {GET_LIB_BY_ID_libraries_list} from '_gqlTypes/GET_LIB_BY_ID';
import {LibraryBehavior} from '_gqlTypes/globalTypes';
import RecordPreview from '../RecordPreview';

interface ILibraryIconProps {
    library: Pick<GET_LIB_BY_ID_libraries_list, 'id' | 'behavior' | 'icon'>;
}

function LibraryIcon({library}: ILibraryIconProps): JSX.Element {
    const iconNameByBehavior: {[key in LibraryBehavior]: SemanticICONS} = {
        [LibraryBehavior.files]: 'images outline',
        [LibraryBehavior.directories]: 'folder outline',
        [LibraryBehavior.standard]: 'file alternate outline'
    };

    const behavior = library?.behavior ?? LibraryBehavior.standard;

    return library?.icon?.whoAmI?.preview ? (
        <RecordPreview image={library.icon.whoAmI.preview.small as string} color={null} label={null} />
    ) : (
        <Icon data-testid="generic-icon" name={iconNameByBehavior[behavior]} size="big" />
    );
}

export default LibraryIcon;
