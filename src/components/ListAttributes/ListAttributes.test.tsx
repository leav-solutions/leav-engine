import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import wait from 'waait';
import {getLang} from '../../queries/cache/lang/getLangQuery';
import {AttributeType, IAttributesChecked} from '../../_types/types';
import MockedProviderWithFragments from '../../__mocks__/MockedProviderWithFragments';
import Attribute from './Attribute';
import ListAttributes from './ListAttributes';

describe('ListAttributes', () => {
    const mocks = [
        {
            request: {
                query: getLang
            },
            result: {
                data: {
                    lang: ['fr']
                }
            }
        }
    ];

    test('should get an Attribute ', async () => {
        const mockAttribute = {
            id: 'test',
            library: 'test_library',
            type: AttributeType.simple,
            label: {
                fr: 'test',
                en: 'test'
            },
            isLink: false,
            isMultiple: false
        };

        const mockAttributesChecked: IAttributesChecked[] = [
            {
                id: 'test',
                library: 'test_library',
                depth: 0,
                checked: false
            }
        ];

        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments mocks={mocks}>
                    <ListAttributes
                        attributes={[mockAttribute]}
                        attributeSelection={'test'}
                        changeSelected={jest.fn()}
                        useCheckbox={false}
                        attributesChecked={mockAttributesChecked}
                        setNewAttributes={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );

            await wait(1);

            comp.update();
        });

        expect(comp.find(Attribute)).toHaveLength(1);
    });
});
