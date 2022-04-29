// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AppstoreOutlined} from '@ant-design/icons';
import {useQuery} from '@apollo/client';
import {localizedTranslation, stringToColor} from '@leav/utils';
import {Avatar, Button, Dropdown, Menu, Skeleton, Tooltip, Typography} from 'antd';
import {ItemType} from 'antd/lib/menu/hooks/useItems';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import {useApplicationContext} from 'context/ApplicationContext';
import {getApplicationsQuery} from 'graphQL/queries/applications/getApplicationsQuery';
import {useLang} from 'hooks/LangHook/LangHook';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import themingVar from 'themingVar';
import {GET_APPLICATIONS} from '_gqlTypes/GET_APPLICATIONS';
import AppLink from './AppLink';

const AppsButton = styled(Button)`
    && {
        &,
        :hover,
        :active,
        :focus {
            border: none;
            color: #fff;
        }
        font-size: 1.5em;
    }
`;

const CustomMenu = styled(Menu)`
    max-height: 80vh;
    overflow-y: auto;
    li {
        display: grid;
        grid-template-columns: 3rem 300px;
        align-content: center;

        .description {
            color: ${themingVar['@leav-secondary-font-color']};
        }
    }

    .ant-typography {
        margin-bottom: 0;
    }
`;

const skeletonItems: ItemType[] = [1, 2, 3].map(el => ({
    key: el,
    icon: <Skeleton.Avatar active size={24} />,
    label: <Skeleton.Input active block size="small" style={{width: '15em', marginLeft: '1em'}} />
}));

function ApplicationSwitcher(): JSX.Element {
    const {t} = useTranslation();
    const [{lang}] = useLang();
    const currentApp = useApplicationContext();

    const {loading, error, data} = useQuery<GET_APPLICATIONS, GET_APPLICATIONSVariables>(getApplicationsQuery);

    const menuItems: ItemType[] = loading
        ? skeletonItems
        : (data?.applications.list ?? [])
              .filter(app => app.id !== currentApp.id)
              .map(app => {
                  const label = localizedTranslation(app.label, lang);
                  const description = localizedTranslation(app.description, lang);
                  const initials = label
                      .split(' ')
                      .slice(0, 2)
                      .map(el => el[0])
                      .join('')
                      .toUpperCase();

                  return {
                      key: app.id,
                      icon: (
                          <AppLink app={app} label={label}>
                              <Avatar style={{backgroundColor: app.color ?? stringToColor(label), marginRight: '1em'}}>
                                  {initials}
                              </Avatar>
                          </AppLink>
                      ),
                      label: (
                          <AppLink app={app} label={label}>
                              <Typography.Paragraph ellipsis={{rows: 1, tooltip: label}}>
                                  {localizedTranslation(app.label, lang)}
                              </Typography.Paragraph>
                              <Typography.Paragraph
                                  ellipsis={{
                                      rows: 1,
                                      tooltip: description
                                  }}
                                  className="description"
                              >
                                  {description}
                              </Typography.Paragraph>
                          </AppLink>
                      )
                  };
              });

    const AppsMenu = <CustomMenu items={menuItems} />;

    const dropdownContent = error ? <ErrorDisplay message={error.message} /> : AppsMenu;

    return (
        <Dropdown overlay={dropdownContent} trigger={['click']}>
            <Tooltip title={t('applications.title')} placement="left">
                <AppsButton
                    name="applications"
                    ghost
                    shape="circle"
                    size="large"
                    icon={<AppstoreOutlined style={{fontSize: '1.5em'}} />}
                    aria-label="applications"
                />
            </Tooltip>
        </Dropdown>
    );
}

export default ApplicationSwitcher;
