// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useApolloClient, useMutation} from '@apollo/client';
import {localizedTranslation} from '@leav/utils';
import AttributesSelectionModal from 'components/attributes/AttributesSelectionModal';
import EditAttributeModal from 'components/attributes/EditAttributeModal';
import ConfirmedButton from 'components/shared/ConfirmedButton';
import SimplisticButton from 'components/shared/SimplisticButton';
import useLang from 'hooks/useLang';
import {saveAttributeQuery} from 'queries/attributes/saveAttributeMutation';
import {getVersionProfileByIdQuery} from 'queries/versionProfiles/getVersionProfileByIdQuery';
import React, {SyntheticEvent, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Icon, Input, Table} from 'semantic-ui-react';
import styled from 'styled-components';
import {borderColorBase, borderRadiusBase, greyBackground} from 'themingVar';
import {
    GET_VERSION_PROFILE_BY_ID_versionProfiles_list,
    GET_VERSION_PROFILE_BY_ID_versionProfiles_list_linkedAttributes
} from '_gqlTypes/GET_VERSION_PROFILE_BY_ID';
import {AttributeType} from '_gqlTypes/globalTypes';
import {SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables} from '_gqlTypes/SAVE_ATTRIBUTE';

const Wrapper = styled.div`
    &&& {
        margin-top: 1rem;
    }
`;

const ListWrapper = styled.div`
    max-height: 20rem;
    overflow-y: auto;
    border-top-left-radius: ${borderRadiusBase};
    border-top-right-radius: ${borderRadiusBase};

    && > table {
        border-radius: 0;
        border-bottom: none;
        border-top: none;
    }
`;

const AttributeRow = styled(Table.Row)`
    cursor: pointer;
`;

const AttributeIdWrapper = styled.span`
    color: rgba(0, 0, 0, 0.4);
    font-size: 0.9rem;
    margin-left: 0.5rem;
`;

const SearchWrapper = styled.div`
    padding: 0.5rem 1rem;
    border: 1px solid ${borderColorBase};
    border-radius: ${borderRadiusBase};
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    background: ${greyBackground};
`;

const Footer = styled.div<{$hasAttributes: boolean}>`
    padding: 0.5rem 1rem;
    border: 1px solid ${borderColorBase};
    border-radius: ${borderRadiusBase};
    background: ${greyBackground};

    ${props =>
        props.$hasAttributes &&
        `
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    `}
`;

interface ILinkedAttributesProps {
    profile: GET_VERSION_PROFILE_BY_ID_versionProfiles_list;
    readonly: boolean;
}

function LinkedAttributes({readonly, profile}: ILinkedAttributesProps): JSX.Element {
    const {lang} = useLang();
    const {t} = useTranslation();

    const [attributeModalDisplay, setAttributeModalDisplay] = useState<{visible: boolean; attribute?: string}>({
        visible: false
    });
    const [saveAttribute] = useMutation<SAVE_ATTRIBUTE, SAVE_ATTRIBUTEVariables>(saveAttributeQuery);
    const apolloClient = useApolloClient();

    const [showAttributeSelector, setShowAttributeSelector] = React.useState(false);
    const [search, setSearch] = React.useState('');

    const _handleOpenAddAttribute = (e: SyntheticEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setShowAttributeSelector(true);
    };

    const _handleCloseAddAttribute = () => {
        setShowAttributeSelector(false);
    };

    const _handleSubmitAddAttribute = async (selectedAttributes: string[]) => {
        try {
            const savedAttributes = await Promise.all(
                selectedAttributes.map(attributeId =>
                    saveAttribute({
                        variables: {
                            attrData: {
                                id: attributeId,
                                versions_conf: {
                                    versionable: true,
                                    profile: profile.id
                                }
                            }
                        }
                    })
                )
            );

            _handleCloseAddAttribute();

            // Update apollo cache
            apolloClient.writeQuery({
                query: getVersionProfileByIdQuery,
                variables: {
                    id: profile.id
                },
                data: {
                    versionProfiles: {
                        __typename: 'VersionProfileList',
                        list: [
                            {
                                ...profile,
                                linkedAttributes: [
                                    ...profile.linkedAttributes,
                                    ...savedAttributes.map(a => a.data.saveAttribute)
                                ]
                            }
                        ]
                    }
                }
            });
        } catch (e) {
            // Exception is handled in Apollo Client
        }
    };

    const _handleUnlinkAttribute = (attributeId: string) => async () => {
        await saveAttribute({
            variables: {
                attrData: {
                    id: attributeId,
                    versions_conf: {
                        versionable: true,
                        profile: null
                    }
                }
            }
        });

        // Update apollo cache
        apolloClient.writeQuery({
            query: getVersionProfileByIdQuery,
            variables: {
                id: profile.id
            },
            data: {
                versionProfiles: {
                    __typename: 'VersionProfileList',
                    list: [
                        {
                            ...profile,
                            linkedAttributes: [...profile.linkedAttributes.filter(a => a.id !== attributeId)]
                        }
                    ]
                }
            }
        });
    };

    const _handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const _handleRowClick = (attribute: GET_VERSION_PROFILE_BY_ID_versionProfiles_list_linkedAttributes) => () => {
        setAttributeModalDisplay({visible: true, attribute: attribute.id});
    };

    const _handleCloseAttributeModal = () => setAttributeModalDisplay({visible: false});

    const attributesList = profile.linkedAttributes.filter(
        a =>
            !search ||
            a.id.match(new RegExp(`${search}`, 'i')) ||
            Object.values(a.label).some(langLabel => langLabel.match(new RegExp(`${search}`, 'i')))
    );

    return (
        <Wrapper className="field">
            <label>{t('version_profiles.linked_attributes')}</label>
            {!!profile.linkedAttributes.length && (
                <SearchWrapper>
                    <Input
                        icon="search"
                        size="small"
                        onChange={_handleSearchChange}
                        placeholder={t('admin.search_placeholder')}
                    />
                </SearchWrapper>
            )}
            <ListWrapper>
                <Table>
                    <Table.Body>
                        {attributesList.map(attribute => {
                            const attributeLabel = localizedTranslation(attribute.label, lang);
                            return (
                                <AttributeRow key={attribute.id} onClick={_handleRowClick(attribute)}>
                                    <Table.Cell>
                                        {attributeLabel}
                                        <AttributeIdWrapper>{attribute.id}</AttributeIdWrapper>
                                    </Table.Cell>
                                    <Table.Cell width={1}>
                                        <ConfirmedButton
                                            action={_handleUnlinkAttribute(attribute.id)}
                                            confirmMessage={t('version_profiles.unlink_attribute_confirm', {
                                                attributeLabel
                                            })}
                                        >
                                            <SimplisticButton icon="cancel" name="unlink" aria-label="unlink" />
                                        </ConfirmedButton>
                                    </Table.Cell>
                                </AttributeRow>
                            );
                        })}
                    </Table.Body>
                </Table>
            </ListWrapper>
            {!readonly && (
                <Footer $hasAttributes={!!profile.linkedAttributes.length}>
                    <SimplisticButton basic labelPosition="left" onClick={_handleOpenAddAttribute}>
                        <Icon name="plus" />
                        {t('version_profiles.link_attributes')}
                    </SimplisticButton>
                </Footer>
            )}
            {showAttributeSelector && (
                <AttributesSelectionModal
                    openModal={showAttributeSelector}
                    onClose={_handleCloseAddAttribute}
                    onSubmit={_handleSubmitAddAttribute}
                    filter={{type: [AttributeType.advanced, AttributeType.advanced_link, AttributeType.tree]}}
                    selection={profile.linkedAttributes.map(a => a.id)}
                />
            )}
            {attributeModalDisplay.visible && (
                <EditAttributeModal
                    open={true}
                    onClose={_handleCloseAttributeModal}
                    attribute={attributeModalDisplay.attribute}
                />
            )}
        </Wrapper>
    );
}

export default LinkedAttributes;
