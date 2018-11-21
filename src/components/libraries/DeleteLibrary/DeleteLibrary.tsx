import {DataProxy} from 'apollo-cache';
import * as React from 'react';
import {withNamespaces, WithNamespaces} from 'react-i18next';
import ConfirmedButton from 'src/components/shared/ConfirmedButton';
import DeleteButton from 'src/components/shared/DeleteButton';
import {DeleteLibMutation, deleteLibQuery} from 'src/queries/libraries/deleteLibMutation';
import {getLibsQuery} from 'src/queries/libraries/getLibrariesQuery';
import {GET_LIBRARIES_libraries} from 'src/_gqlTypes/GET_LIBRARIES';

interface IDeleteLibraryProps extends WithNamespaces {
    library: GET_LIBRARIES_libraries;
}

class DeleteLibrary extends React.Component<IDeleteLibraryProps> {
    constructor(props: IDeleteLibraryProps) {
        super(props);
    }

    public render() {
        const {library, t} = this.props;

        return (
            <DeleteLibMutation mutation={deleteLibQuery} update={this._updateCache}>
                {deleteLib => {
                    const onDelete = async () =>
                        deleteLib({
                            variables: {libID: library.id}
                        });

                    const libLabel =
                        library.label !== null ? library.label.fr || library.label.en || library.id : library.id;

                    return (
                        <ConfirmedButton action={onDelete} confirmMessage={t('libraries.confirm_delete', {libLabel})}>
                            <DeleteButton disabled={!!library.system} />
                        </ConfirmedButton>
                    );
                }}
            </DeleteLibMutation>
        );
    }

    private _updateCache = (cache: DataProxy, {data: {deleteLibrary}}) => {
        const cacheData: any = cache.readQuery({query: getLibsQuery});
        cache.writeQuery({
            query: getLibsQuery,
            data: {libraries: cacheData.libraries.filter(l => l.id !== deleteLibrary.id)}
        });
    }
}

export default withNamespaces()(DeleteLibrary);
