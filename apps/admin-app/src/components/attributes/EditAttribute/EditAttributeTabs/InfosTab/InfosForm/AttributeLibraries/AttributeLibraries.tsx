// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMutation, useQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import FormFieldWrapper from 'components/shared/FormFieldWrapper';
import Loading from 'components/shared/Loading';
import difference from 'lodash/difference';
import {getLibrariesWithAttributesQuery} from 'queries/libraries/getLibrariesWithAttributesQuery';
import {saveLibAttributesMutation} from 'queries/libraries/saveLibAttributesMutation';
import React, {SyntheticEvent, useMemo} from 'react';
import {DropdownProps, FormDropdownProps} from 'semantic-ui-react';
import {GET_ATTRIBUTE_BY_ID_attributes_list} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {
    GET_LIBRARIES_WITH_ATTRIBUTES,
    GET_LIBRARIES_WITH_ATTRIBUTES_libraries_list
} from '_gqlTypes/GET_LIBRARIES_WITH_ATTRIBUTES';
import {SAVE_LIBRARY_ATTRIBUTES, SAVE_LIBRARY_ATTRIBUTESVariables} from '_gqlTypes/SAVE_LIBRARY_ATTRIBUTES';
import AttributeLibrariesField from './AttributeLibrariesField';

export type AttributeLibrariesOnChange = (
    e: SyntheticEvent<HTMLElement>,
    fieldData: DropdownProps & {value: GET_LIBRARIES_WITH_ATTRIBUTES_libraries_list[]}
) => void;

interface IAttributeLibrariesProps extends Omit<FormDropdownProps, 'onChange' | 'value'> {
    attribute: GET_ATTRIBUTE_BY_ID_attributes_list;
}

function AttributeLibraries({attribute, onChange, ...fieldProps}: IAttributeLibrariesProps): JSX.Element {
    const {loading, error, data} = useQuery<GET_LIBRARIES_WITH_ATTRIBUTES>(getLibrariesWithAttributesQuery);
    const [saveLibrary, {loading: loadingSave, error: saveError}] = useMutation<
        SAVE_LIBRARY_ATTRIBUTES,
        SAVE_LIBRARY_ATTRIBUTESVariables
    >(saveLibAttributesMutation, {
        onError: e => undefined // To prevent unhandled rejection, error is managed with error variable
    });

    const libraries = data?.libraries?.list ?? [];
    const librariesById: Record<string, GET_LIBRARIES_WITH_ATTRIBUTES_libraries_list> = useMemo(
        () =>
            libraries.reduce((libs, lib) => {
                libs[lib.id] = lib;
                return libs;
            }, {}),
        [libraries]
    );

    const _handleChange = async (e: SyntheticEvent<HTMLElement>, fieldData: DropdownProps) => {
        const attributeLibrariesIds = attribute.libraries.map(lib => lib.id);
        const addedValues = difference(fieldData.value as string[], attributeLibrariesIds);
        const removedValues = difference(attributeLibrariesIds, fieldData.value as string[]);

        // Added libraries
        await Promise.all([
            ...addedValues.map(libraryId =>
                saveLibrary({
                    variables: {
                        libId: libraryId,
                        attributes: [...librariesById[libraryId].attributes.map(a => a.id), attribute.id]
                    }
                })
            ),
            ...removedValues.map(libraryId =>
                saveLibrary({
                    variables: {
                        libId: libraryId,
                        attributes: [
                            ...librariesById[libraryId].attributes.filter(a => a.id !== attribute.id).map(a => a.id)
                        ]
                    }
                })
            )
        ]);
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    return (
        <FormFieldWrapper error={saveError?.message}>
            <AttributeLibrariesField
                libraries={libraries}
                {...fieldProps}
                onChange={_handleChange}
                loading={loadingSave}
                defaultValue={attribute.libraries.map(l => l.id)}
            />
        </FormFieldWrapper>
    );
}

export default AttributeLibraries;
