// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedResponse} from '@apollo/client/testing';
import {History} from 'history';
import {getAttributesQuery} from 'queries/attributes/getAttributesQuery';
import {BrowserRouter as Router} from 'react-router-dom-v5';
import {act, render, screen} from '_tests/testUtils';
import {mockAttrSimple} from '__mocks__/attributes';
import {Mockify} from '../../../_types/Mockify';
import Attributes from './Attributes';

jest.mock('../AttributesList', () => {
    return function AttributesList() {
        return <div>AttributesList</div>;
    };
});

describe('Attributes', () => {
    test('Snapshot test', async () => {
        const mockHistory: Mockify<History> = {};

        const mocks: MockedResponse[] = [
            {
                request: {
                    query: getAttributesQuery
                },
                result: {
                    data: {
                        attributes: {
                            list: [mockAttrSimple]
                        }
                    }
                }
            }
        ];

        await act(async () => {
            render(
                <Router>
                    <Attributes history={mockHistory as History} />
                </Router>,
                {apolloMocks: mocks}
            );
        });

        expect(screen.getByText('AttributesList')).toBeInTheDocument();
    });
});
