// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Input} from 'antd';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

interface IApplicationsSearchProps {
    onSearch: (search: string) => void;
}

const Wrapper = styled.div`
    background: #fff;
    text-align: center;
    padding: 0.5rem;
`;

function ApplicationsSearch({onSearch}: IApplicationsSearchProps): JSX.Element {
    const {t} = useTranslation();

    const _handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearch(e.target.value);
    };

    return (
        <Wrapper>
            <Input.Search
                placeholder={t('search_placeholder')}
                onSearch={onSearch}
                onChange={_handleChange}
                style={{width: '50vw'}}
            />
        </Wrapper>
    );
}

export default ApplicationsSearch;
