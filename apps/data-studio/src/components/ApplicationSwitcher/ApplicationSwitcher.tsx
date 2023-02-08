// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AppstoreOutlined} from '@ant-design/icons';
import {useQuery} from '@apollo/client';
import {themeVars} from '@leav/ui';
import {localizedTranslation} from '@leav/utils';
import {Button, Drawer, Menu, Skeleton, Tooltip, Typography} from 'antd';
import {ItemType} from 'antd/lib/menu/hooks/useItems';
import ErrorDisplay from 'components/shared/ErrorDisplay';
import RecordPreview from 'components/shared/RecordPreview';
import {useApplicationContext} from 'context/ApplicationContext';
import {getApplicationsQuery} from 'graphQL/queries/applications/getApplicationsQuery';
import {useLang} from 'hooks/LangHook/LangHook';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
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
    && {
        max-height: 80vh;
        overflow-y: auto;
        li {
            display: grid;
            grid-template-columns: 4rem 300px;
            align-content: center;
            height: auto;

            .description {
                color: ${themeVars.secondaryTextColor};
            }
        }

        .ant-typography {
            margin-bottom: 0;
        }
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
    const appData = useApplicationContext();

    const [isVisible, setIsVisible] = useState(false);

    const {loading, error, data} = useQuery<GET_APPLICATIONS>(getApplicationsQuery);

    const apps = data?.applications?.list ?? [];

    // Hardcoded IDs for portal and login will be removed when they'll be configured
    const portalApp = apps.find(app => app.id === 'portal');
    const loginApp = apps.find(app => app.id === 'login');
    const portalLabel = localizedTranslation(portalApp?.label, lang);

    const menuItems: ItemType[] = loading
        ? skeletonItems
        : apps
              .filter(app => app.id !== appData.currentApp.id && ![portalApp?.id, loginApp?.id].includes(app.id))
              .map(app => {
                  const label = localizedTranslation(app.label, lang);
                  const description = localizedTranslation(app.description, lang);

                  return {
                      key: app.id,
                      icon: (
                          <AppLink app={app} label={label}>
                              <RecordPreview
                                  label={label}
                                  color={app.color}
                                  image={app?.icon?.whoAmI?.preview?.small}
                              />
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

    if (portalApp) {
        menuItems.unshift({
            key: portalApp.id,
            icon: (
                <AppLink app={portalApp} label={portalLabel}>
                    <RecordPreview
                        label={portalLabel}
                        color={portalApp.color}
                        image={portalApp?.icon?.whoAmI?.preview?.small}
                    />
                </AppLink>
            ),
            label: (
                <AppLink app={portalApp} label={portalLabel}>
                    <Typography.Paragraph ellipsis={{rows: 1, tooltip: portalLabel}}>
                        {portalLabel}
                    </Typography.Paragraph>
                </AppLink>
            )
        });
    }

    const AppsMenu = <CustomMenu items={menuItems} />;

    const dropdownContent = error ? <ErrorDisplay message={error.message} /> : AppsMenu;

    const _handleOpen = () => setIsVisible(true);
    const _handleClose = () => setIsVisible(false);

    return (
        <>
            <Tooltip title={t('applications.title')} placement="left">
                <AppsButton
                    name="applications"
                    ghost
                    shape="circle"
                    size="large"
                    icon={<AppstoreOutlined style={{fontSize: '1.5em', color: '#000'}} />}
                    aria-label="applications"
                    onClick={_handleOpen}
                />
            </Tooltip>
            <Drawer open={isVisible} onClose={_handleClose} placement="right" closable={false} bodyStyle={{padding: 0}}>
                {dropdownContent}
            </Drawer>
        </>
    );
}

export default ApplicationSwitcher;
