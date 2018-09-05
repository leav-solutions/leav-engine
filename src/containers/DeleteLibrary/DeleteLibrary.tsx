import {DataProxy} from 'apollo-cache';
import * as React from 'react';
import {translate, TranslationFunction} from 'react-i18next';
import {Confirm} from 'semantic-ui-react';
import DeleteLibraryButton from '../../components/DeleteLibraryButton';
import {DeleteLibMutation, deleteLibQuery} from '../../queries/deleteLibMutation';
import {getLibsQuery} from '../../queries/getLibrariesQuery';
import {GET_LIBRARIES_libraries} from '../../_gqlTypes/GET_LIBRARIES';

interface IDeleteLibraryProps {
    library: GET_LIBRARIES_libraries;
    t: TranslationFunction;
}

interface IDeleteLibraryState {
    showConfirm: boolean;
}

class DeleteLibrary extends React.Component<IDeleteLibraryProps, IDeleteLibraryState> {
    constructor(props: IDeleteLibraryProps) {
        super(props);

        this.state = {
            showConfirm: false
        };
    }

    public render() {
        const {library, t} = this.props;
        const {showConfirm} = this.state;

        return (
            <DeleteLibMutation mutation={deleteLibQuery} update={this._updateCache}>
                {deleteLib => {
                    const onDelete = async (e: React.SyntheticEvent) => {
                        this._closeConfirm(e);
                        await deleteLib({
                            variables: {libID: library.id}
                        });
                    };

                    const libLabel =
                        library.label !== null ? library.label.fr || library.label.en || library.id : library.id;

                    /**
                     * Prevent click on confirm modal from propagating to its parents
                     *
                     * @param e
                     */
                    const disableClick = (e: React.SyntheticEvent) => e.preventDefault();

                    return (
                        <div onClick={disableClick}>
                            <DeleteLibraryButton onDelete={this._openConfirm} />
                            <Confirm
                                open={showConfirm}
                                content={t('libraries.confirm_delete', {libLabel})}
                                onCancel={this._closeConfirm}
                                onConfirm={onDelete}
                                cancelButton={t('admin.cancel')}
                                closeOnDocumentClick={false}
                                closeOnDimmerClick={false}
                            />
                        </div>
                    );
                }}
            </DeleteLibMutation>
        );
    }

    private _openConfirm = (e: React.SyntheticEvent) => {
        e.preventDefault();
        this.setState({showConfirm: true});
    }
    private _closeConfirm = (e: React.SyntheticEvent) => {
        e.preventDefault();
        this.setState({showConfirm: false});
    }

    private _updateCache = (cache: DataProxy, {data: {deleteLibrary}}) => {
        const cacheData: any = cache.readQuery({query: getLibsQuery});
        cache.writeQuery({
            query: getLibsQuery,
            data: {libraries: cacheData.libraries.filter(l => l.id !== deleteLibrary.id)}
        });
    }
}

export default translate()(DeleteLibrary);
