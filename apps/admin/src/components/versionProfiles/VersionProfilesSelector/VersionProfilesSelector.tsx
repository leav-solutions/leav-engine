import ErrorDisplay from '../../shared/ErrorDisplay';
import {type FormDropdownProps} from 'semantic-ui-react';
import VersionProfilesSelectorField from './VersionProfilesSelectorField';
import {useGetVersionProfilesQuery} from '../../../_gqlTypes';

function VersionProfilesSelector(fieldProps: FormDropdownProps): JSX.Element {
    const {loading, error: queryError, data} = useGetVersionProfilesQuery();

    if (queryError) {
        return <ErrorDisplay message={queryError.message} />;
    }

    const profiles = data?.versionProfiles?.list || [];

    return <VersionProfilesSelectorField {...fieldProps} loading={loading} profiles={profiles} />;
}

export default VersionProfilesSelector;
