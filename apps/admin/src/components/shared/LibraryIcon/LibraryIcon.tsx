import {Icon, type SemanticICONS} from 'semantic-ui-react';
import {type GET_LIB_BY_ID_libraries_list} from '../../../_gqlTypes/GET_LIB_BY_ID';
import {LibraryBehavior} from '../../../_gqlTypes';
import RecordPreview from '../RecordPreview';

interface ILibraryIconProps {
    library: Pick<GET_LIB_BY_ID_libraries_list, 'id' | 'behavior' | 'icon'>;
}

function LibraryIcon({library}: ILibraryIconProps): JSX.Element {
    const iconNameByBehavior: {[key in LibraryBehavior]: SemanticICONS} = {
        [LibraryBehavior.files]: 'images outline',
        [LibraryBehavior.join]: 'table',
        [LibraryBehavior.directories]: 'folder outline',
        [LibraryBehavior.standard]: 'file alternate outline',
    };

    const behavior = library?.behavior ?? LibraryBehavior.standard;

    return library?.icon?.whoAmI?.preview ? (
        <RecordPreview image={library.icon.whoAmI.preview.small as string} color={null} label={null} />
    ) : (
        <Icon data-testid="generic-icon" name={iconNameByBehavior[behavior]} size="big" />
    );
}

export default LibraryIcon;
