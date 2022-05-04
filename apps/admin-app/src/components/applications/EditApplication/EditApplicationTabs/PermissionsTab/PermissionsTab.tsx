// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import DefinePermByUserGroupView from 'components/permissions/DefinePermByUserGroupView';
import {useEditApplicationContext} from 'context/EditApplicationContext';
import React from 'react';
import styled from 'styled-components';
import {PermissionTypes} from '_gqlTypes/globalTypes';

const Wrapper = styled.div`
    display: grid;
    grid-template-rows: auto;
`;

function PermissionsTab(): JSX.Element {
    const {application, readonly} = useEditApplicationContext();

    return (
        <Wrapper>
            <DefinePermByUserGroupView
                type={PermissionTypes.application}
                applyTo={application.id}
                readOnly={readonly}
            />
        </Wrapper>
    );
}

export default PermissionsTab;
