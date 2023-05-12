// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import Loading from 'components/shared/Loading';
import useMenuItems from 'hooks/useMenuItems';
import {IMenuItem} from 'hooks/useMenuItems/useMenuItems';
import {getStatsQuery} from 'queries/stats/getStatsQuery';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {Statistic} from 'semantic-ui-react';
import styled from 'styled-components';
import {GET_STATS} from '_gqlTypes/GET_STATS';

const StatsGroup = styled(Statistic.Group)`
    && {
        display: flex;
        justify-content: center;
        gap: 2rem;
        flex-direction: row;
        flex-wrap: wrap;
        margin: 0;
        ::after {
            content: none;
        }
    }
`;

const StatItem = styled(Statistic)`
    &&&& {
        border: 1px solid #ccc;
        padding: 1rem;
        width: 13rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 1rem;
        cursor: pointer;
        box-shadow: 1px 1px 4px #ccc;
        margin: 0;
    }
`;

const StatLabel = styled(Statistic.Label)`
    &&&&& {
        text-transform: none;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
`;

function Stats(): JSX.Element {
    const {loading, error, data} = useQuery<GET_STATS>(getStatsQuery);
    const {t} = useTranslation();
    const menuItems = useMenuItems({size: 'small'});
    const history = useHistory();

    const itemsByKey: {[key: string]: IMenuItem} = menuItems.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
    }, {});

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <ErrorDisplay />;
    }

    const statsParts = [
        {
            label: t('libraries.title'),
            route: 'libraries',
            value: data?.libraries?.totalCount ?? 0,
            icon: itemsByKey.libraries.icon
        },
        {
            label: t('attributes.title'),
            route: 'attributes',
            value: data?.attributes?.totalCount ?? 0,
            icon: itemsByKey.attributes.icon
        },
        {label: t('trees.title'), route: 'trees', value: data?.trees?.totalCount ?? 0, icon: itemsByKey.trees.icon},
        {
            label: t('applications.title'),
            route: 'applications',
            value: data?.applications?.totalCount ?? 0,
            icon: itemsByKey.applications.icon
        }
    ];

    const _handleItemClick = (route: string) => () => {
        history.push(`/${route}`);
    };

    return (
        <StatsGroup>
            {statsParts.map(stat => (
                <StatItem key={stat.label} onClick={_handleItemClick(stat.route)} title={stat.label}>
                    <StatLabel>
                        {stat.icon} {stat.label}
                    </StatLabel>
                    <Statistic.Value>{stat.value}</Statistic.Value>
                </StatItem>
            ))}
        </StatsGroup>
    );
}

export default Stats;
