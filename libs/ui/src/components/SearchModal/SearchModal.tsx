import {type FunctionComponent} from 'react';
import {ErrorDisplayTypes} from '_ui/constants';
import useGetLibraryDetailExtendedQuery from '_ui/hooks/useGetLibraryDetailExtendedQuery/useGetLibraryDetailExtendedQuery';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {type ISearchSelection} from '_ui/types';
import {ErrorDisplay} from '../ErrorDisplay';
import {Loading} from '../Loading';
import {Explorer} from '../Explorer';
import {KitModal} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus, faXmark} from '@fortawesome/free-solid-svg-icons';

interface ISearchModalProps {
    libId: string;
    visible: boolean;
    setVisible: (visible: boolean) => void;
    submitAction: (selection: ISearchSelection) => void;
}

export const SearchModal: FunctionComponent<ISearchModalProps> = ({visible, setVisible, submitAction, libId}) => {
    const {t} = useSharedTranslation();

    const _handleModalClose = () => {
        setVisible(false);
    };

    const renderModal = (content: JSX.Element): JSX.Element => (
        <KitModal
            isOpen={visible}
            height="60vh"
            width="70vw"
            title={t('record_edition.add_value')}
            closeIcon={<FontAwesomeIcon icon={faXmark} />}
            showCloseIcon
            destroyOnClose
            close={_handleModalClose}
        >
            {content}
        </KitModal>
    );

    const {loading, data, error} = useGetLibraryDetailExtendedQuery({library: libId});

    if (loading) {
        return renderModal(<Loading />);
    }

    if (error) {
        return renderModal(<ErrorDisplay message={error.message} />);
    }

    if (!data?.libraries?.list?.length) {
        return renderModal(<ErrorDisplay message={t('lib_detail.not_found', {libraryId: libId})} />);
    }

    if (!data.libraries.list[0].permissions.access_library) {
        return <ErrorDisplay type={ErrorDisplayTypes.PERMISSION_ERROR} showActionButton={false} />;
    }

    return renderModal(
        <Explorer
            entrypoint={{
                type: 'library',
                libraryId: data.libraries.list[0].id,
            }}
            showSearch
            showFilters
            showSorts
            defaultActionsForItem={[]}
            defaultPrimaryActions={[]}
            defaultMassActions={[]}
            massActions={[
                {
                    label: t('global.add'),
                    icon: <FontAwesomeIcon icon={faPlus} />,
                    deselectAll: true,
                    callback: (_, massSelection) => {
                        submitAction({
                            selected:
                                massSelection === 'all'
                                    ? []
                                    : massSelection.map(selectedRecord => ({
                                          id: String(selectedRecord),
                                          label: String(selectedRecord),
                                          library: libId,
                                      })),
                            allSelected: massSelection === 'all',
                        });
                        _handleModalClose();
                    },
                },
            ]}
        />,
    );
};

export default SearchModal;
