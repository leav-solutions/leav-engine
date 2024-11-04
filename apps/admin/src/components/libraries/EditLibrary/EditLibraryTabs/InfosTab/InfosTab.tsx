// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useLazyQuery, useMutation} from '@apollo/client';
import {useHistory} from 'react-router-dom-v5';
import {getLibByIdQuery} from '../../../../../queries/libraries/getLibraryById';
import {saveLibQuery} from '../../../../../queries/libraries/saveLibMutation';
import {clearCacheForQuery} from '../../../../../utils';
import {
    GET_LIB_BY_ID,
    GET_LIB_BY_IDVariables,
    GET_LIB_BY_ID_libraries_list
} from '../../../../../_gqlTypes/GET_LIB_BY_ID';
import {IFormError} from '../../../../../_types/errors';
import InfosForm from './InfosForm';

interface IInfosTabProps {
    library: GET_LIB_BY_ID_libraries_list | null;
    readonly: boolean;
}

function InfosTab({library, readonly}: IInfosTabProps): JSX.Element {
    const history = useHistory();
    const isNewLib = !library;

    const [saveLibrary, {error: errorSave}] = useMutation(saveLibQuery, {
        // Prevents Apollo from throwing an exception on error state. Errors are managed with the error variable
        onError: () => undefined,
        update: cache => {
            // There might be a lot of different lists with different
            // filters in cache, thus we just revoke everything
            if (isNewLib) {
                clearCacheForQuery(cache, 'libraries');
            }
        }
    });

    const [getLibById, {data: dataLibById}] = useLazyQuery<GET_LIB_BY_ID, GET_LIB_BY_IDVariables>(getLibByIdQuery, {
        fetchPolicy: 'no-cache'
    });

    const _handleCheckIdExists = async val => {
        await getLibById({variables: {id: val}});

        return !!dataLibById && !!dataLibById.libraries && !dataLibById.libraries.list.length;
    };

    const _handleSubmit = async libData => {
        const dataToSave = {
            id: libData.id,
            label: {
                fr: libData.label.fr,
                en: libData.label.en
            },
            icon: libData.icon?.whoAmI
                ? {
                      libraryId: libData.icon.whoAmI.library.id,
                      recordId: libData.icon.whoAmI.id
                  }
                : null,
            behavior: libData.behavior,
            defaultView: libData.defaultView || null,
            fullTextAttributes: libData.fullTextAttributes,
            recordIdentityConf:
                libData.recordIdentityConf !== null
                    ? {
                          label: libData.recordIdentityConf.label,
                          preview: libData.recordIdentityConf.preview,
                          color: libData.recordIdentityConf.color,
                          treeColorPreview: libData.recordIdentityConf.treeColorPreview
                      }
                    : null
        };
        await saveLibrary({
            variables: {
                libData: dataToSave
            }
        });

        if (isNewLib) {
            history.replace({pathname: '/libraries/edit/' + libData.id});
        }
    };

    const formErrors = errorSave?.graphQLErrors?.length ? errorSave.graphQLErrors[0] : null;

    return (
        <InfosForm
            library={library}
            onSubmit={_handleSubmit}
            readonly={readonly}
            errors={(formErrors as unknown) as IFormError}
            onCheckIdExists={_handleCheckIdExists}
        />
    );
}

export default InfosTab;
