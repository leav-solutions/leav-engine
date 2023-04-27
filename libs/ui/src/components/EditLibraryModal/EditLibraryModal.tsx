// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
interface IEditLibraryModalProps {
    libraryId?: string;
    open: boolean;
    onPostSave?: () => void;
}

function EditLibraryModal({open}: IEditLibraryModalProps): JSX.Element {
    return <div>Edit library</div>;
}

export default EditLibraryModal;
