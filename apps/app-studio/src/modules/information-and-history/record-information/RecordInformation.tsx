import {KitSpace, KitTypography} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {recordInformationContainer, recordInformationLabel} from './recordInformation.module.css';
import {useGetRecordInformation} from './get-record-information/useGetRecordInformation';
import {ErrorDisplay, Loading} from '_ui/components';
import {UserInfo} from './UserInfo';

//TODO: Add some tests
export const RecordInformation = ({recordId, libraryId}: {recordId: string; libraryId: string}) => {
    const {t} = useTranslation();

    const {recordInformation, loading, error} = useGetRecordInformation({recordId, libraryId});

    if (loading) {
        // TODO: Add a better loading state
        return <Loading />;
    }

    if (error) {
        //TODO: Add a better error state
        return <ErrorDisplay />;
    }

    return (
        <KitSpace className={recordInformationContainer} direction="vertical" size="s">
            <KitSpace direction="horizontal" size="s" align="baseline">
                <KitTypography.Text className={recordInformationLabel} size="fontSize5">
                    {t('information_and_history.id')}
                </KitTypography.Text>
                <KitTypography.Text size="fontSize5">{recordId}</KitTypography.Text>
            </KitSpace>
            <KitSpace direction="horizontal" size="s" align="baseline">
                <KitTypography.Text className={recordInformationLabel} size="fontSize5">
                    {t('information_and_history.library')}
                </KitTypography.Text>
                <KitTypography.Text size="fontSize5">{recordInformation.libraryName}</KitTypography.Text>
            </KitSpace>
            <KitSpace direction="horizontal" size="s" align="baseline">
                <KitTypography.Text className={recordInformationLabel} size="fontSize5">
                    {t('information_and_history.creation')}
                </KitTypography.Text>
                <KitTypography.Text size="fontSize5">
                    {t('information_and_history.created_at', {
                        date: recordInformation.createdAt,
                        interpolation: {escapeValue: false},
                    })}
                    <UserInfo email={recordInformation.createdBy.email} id={recordInformation.createdBy.id} />
                </KitTypography.Text>
            </KitSpace>
            <KitSpace direction="horizontal" size="s" align="baseline">
                <KitTypography.Text className={recordInformationLabel} size="fontSize5">
                    {t('information_and_history.last_modification')}
                </KitTypography.Text>
                <KitTypography.Text size="fontSize5">
                    {t('information_and_history.modified_at', {
                        date: recordInformation.modifiedAt,
                        interpolation: {escapeValue: false},
                    })}{' '}
                    <UserInfo email={recordInformation.modifiedBy.email} id={recordInformation.modifiedBy.id} />
                </KitTypography.Text>
            </KitSpace>
        </KitSpace>
    );
};
