import {type IActiveLibrary} from '../../graphQL/queries/cache/activeLibrary/getActiveLibraryQuery';
import {LibraryBehavior} from '../../_gqlTypes';
import {mockLibraryPermissions} from './library';

export const mockActiveLibrary: IActiveLibrary = {
    id: 'activeLibraryId',
    name: 'activeLibraryName',
    behavior: LibraryBehavior.standard,
    attributes: [],
    trees: [],
    permissions: mockLibraryPermissions,
};
