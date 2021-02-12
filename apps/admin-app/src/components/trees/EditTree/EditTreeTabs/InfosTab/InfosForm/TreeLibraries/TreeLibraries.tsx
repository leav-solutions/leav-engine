// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {useTranslation} from 'react-i18next';
import {Button, Checkbox, Grid, Icon, Segment} from 'semantic-ui-react';
import styled from 'styled-components';
import {TreeLibraryInput} from '../../../../../../../_gqlTypes/globalTypes';
import LibrariesSelector from '../../../../../../libraries/LibrariesSelector';

interface ITreeLibrariesProps {
    libraries: TreeLibraryInput[];
    onChange: (libraries: TreeLibraryInput[]) => void;
    readonly: boolean;
}

const BlockLabel = styled.label`
    font-weight: 700;
`;

const DeleteIcon = styled(Icon)`
    cursor: pointer;
`;

function TreeLibraries({onChange, libraries, readonly}: ITreeLibrariesProps): JSX.Element {
    const {t} = useTranslation();

    const _handleSettingsChange = (index: number) => (_, data) => {
        console.log('data :>> ', data);
        const newLibs = libraries;
        newLibs[index].settings = {
            ...newLibs[index].settings,
            [data.name]: data.type === 'checkbox' ? data.checked : data.value
        };

        onChange(newLibs);
    };

    const _handleLibChange = (index: number) => (_, data) => {
        const newLibs = libraries;
        newLibs[index].library = data.value;

        onChange(newLibs);
    };

    const _handleAddLibrary = () => {
        onChange([
            ...libraries,
            {
                library: '',
                settings: {
                    allowMultiplePositions: false
                }
            }
        ]);
    };

    const _handleDeleteLibrary = (index: number) => () => {
        const newLibs = [...libraries];
        onChange([...newLibs.splice(0, index), ...newLibs.splice(index + 1)]);
    };

    return (
        <>
            <Grid>
                <Grid.Column textAlign="left" floated="left" width={8} verticalAlign="middle">
                    <BlockLabel>{t('trees.libraries')}</BlockLabel>
                </Grid.Column>
                {!readonly && (
                    <Grid.Column floated="right" width={8} textAlign="right" verticalAlign="middle">
                        <Button
                            data-test-id="add-button"
                            type="button"
                            icon
                            labelPosition="left"
                            size="small"
                            onClick={_handleAddLibrary}
                        >
                            <Icon name="plus" />
                            {t('trees.add_library')}
                        </Button>
                    </Grid.Column>
                )}
            </Grid>
            {libraries.map((treeLib, index) => (
                <Segment key={index}>
                    <Grid columns={3} stackable>
                        <Grid.Row verticalAlign="middle">
                            <Grid.Column width={4}>
                                <LibrariesSelector
                                    data-test-id="lib-selector"
                                    disabled={readonly}
                                    multiple={false}
                                    fluid
                                    selection
                                    name="libraries"
                                    onChange={_handleLibChange(index)}
                                    value={treeLib.library}
                                />
                            </Grid.Column>
                            <Grid.Column width={11} textAlign="right">
                                <Checkbox
                                    data-test-id={`settings-allowMultiplePositions-${treeLib.library}`}
                                    toggle
                                    name="allowMultiplePositions"
                                    checked={treeLib.settings.allowMultiplePositions}
                                    label={t('trees.allow_multiple_positions')}
                                    onChange={_handleSettingsChange(index)}
                                    disabled={readonly}
                                />
                            </Grid.Column>
                            {!readonly && (
                                <Grid.Column width={1} textAlign="right">
                                    <DeleteIcon
                                        data-test-id="delete-button"
                                        name="cancel"
                                        onClick={_handleDeleteLibrary(index)}
                                    />
                                </Grid.Column>
                            )}
                        </Grid.Row>
                    </Grid>
                </Segment>
            ))}
        </>
    );
}

export default TreeLibraries;
