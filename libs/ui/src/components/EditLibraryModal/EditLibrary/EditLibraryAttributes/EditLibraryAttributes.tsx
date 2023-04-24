// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GetLibraryByIdQuery, LibraryAttributesFragment, useSaveLibraryMutation} from '../../../../_gqlTypes';
import {AttributesList} from './AttributesList';

interface IEditLibraryAttributesProps {
    library: GetLibraryByIdQuery['libraries']['list'][number];
}

function EditLibraryAttributes({library}: IEditLibraryAttributesProps): JSX.Element {
    const [saveLibrary] = useSaveLibraryMutation();
    const isReadOnly = !(library.permissions?.admin_library ?? true);

    const _handleAddAttributes = async (attributes: string[]) => {
        const newAttributes = [...(library.attributes ?? []).map(a => a.id), ...attributes];

        await saveLibrary({
            variables: {
                library: {
                    id: library.id,
                    attributes: newAttributes
                }
            }
        });
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
            readOnly={isReadOnly}
            onAddAttributes={_handleAddAttributes}
            onDeleteAttribute={_handleDeleteAttribute}
            attributes={library.attributes}
        />
    );
}

export default EditLibraryAttributes;
