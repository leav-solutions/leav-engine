// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ErrorDisplay from '../../../shared/ErrorDisplay';
import Loading from '../../../shared/Loading';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import {Statistic} from 'semantic-ui-react';
import styled from 'styled-components';
import {useGetStatsQuery} from '../../../../_gqlTypes';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBook, faRectangleList, faFolderTree, faBorderAll} from '@fortawesome/free-solid-svg-icons';

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
    const {loading, error, data} = useGetStatsQuery();
    const {t} = useTranslation();
    const navigate = useNavigate();

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
            icon: <FontAwesomeIcon icon={faBook} />,
        },
        {
            label: t('attributes.title'),
            route: 'attributes',
            value: data?.attributes?.totalCount ?? 0,
            icon: <FontAwesomeIcon icon={faRectangleList} />,
        },
        {
            label: t('trees.title'),
            route: 'trees',
            value: data?.trees?.totalCount ?? 0,
            icon: <FontAwesomeIcon icon={faFolderTree} />,
        },
        {
            label: t('applications.title'),
            route: 'applications',
            value: data?.applications?.totalCount ?? 0,
            icon: <FontAwesomeIcon icon={faBorderAll} />,
        },
    ];

    const _handleItemClick = (route: string) => () => {
        navigate(`/${route}`);
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
