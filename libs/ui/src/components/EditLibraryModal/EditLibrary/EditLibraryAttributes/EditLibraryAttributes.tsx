// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GetLibraryByIdQuery, LibraryAttributesFragment, useSaveLibraryMutation} from '../../../../_gqlTypes';
import {AttributesList} from './AttributesList';

interface IEditLibraryAttributesProps {
    library: GetLibraryByIdQuery['libraries']['list'][number];
    readOnly?: boolean;
}

function EditLibraryAttributes({library, readOnly}: IEditLibraryAttributesProps): JSX.Element {
    const [saveLibrary] = useSaveLibraryMutation();
    const isReadOnly = readOnly || !(library.permissions?.admin_library ?? true);

    const _handleAddAttributes = async (attributes: string[]) => {
        const newAttributes = [...(library.attributes ?? []).map(a => a.id), ...attributes];

        try {
            await saveLibrary({
                variables: {
                    library: {
                        id: library.id,
                        attributes: newAttributes
                    }
                }
            });
        } catch (e) {
            console.error(e);
        }
    };

    const _handleDeleteAttribute = async (attribute: LibraryAttributesFragment) => {
        const newAttributes = (library.attributes ?? []).filter(attr => attr.id !== attribute.id).map(a => a.id);

        await saveLibrary({
            variables: {
                library: {
                    id: library.id,
                    attributes: newAttributes
                }
            }
        });
    };

    return (
        <AttributesList
            library={library.id}
            readOnly={isReadOnly}
            onAddAttributes={_handleAddAttributes}
            onDeleteAttribute={_handleDeleteAttribute}
        />
    );
}

export default EditLibraryAttributes;
