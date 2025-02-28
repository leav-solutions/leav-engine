// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent} from 'react';
import {RecordFormElementsValueStandardValue} from '_ui/hooks/useGetRecordForm';
import {KitBadge, KitTabs, KitTree} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {FaLayerGroup, FaSquareRootAlt} from 'react-icons/fa';
import styled from 'styled-components';

const InformationsWrapper = styled.div`
    margin-top: calc(var(--general-spacing-s) * 1px);
`;

interface IValuesSummaryProps {
    globalValues?: Array<RecordFormElementsValueStandardValue['payload']>;
    calculatedValue?: RecordFormElementsValueStandardValue['payload'];
}

const calculatedValueKey = '0';
const globalValueKey = '1';

// https://stackoverflow.com/questions/822452/strip-html-tags-from-text-using-plain-javascript
const stripHtml = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
};

const _isDateRangeValue = (value: any): value is {from: string; to: string} =>
    !!value && typeof value === 'object' && 'from' in value && 'to' in value;

export const ValuesSummary: FunctionComponent<IValuesSummaryProps> = ({globalValues = [], calculatedValue}) => {
    const {t} = useSharedTranslation();

    const stringifyValue = (value: RecordFormElementsValueStandardValue['payload']): string => {
        if (typeof value === 'string') {
            return stripHtml(value);
        }

        if (_isDateRangeValue(value)) {
            return t('record_edition.date_range_value', {
                from: value.from,
                to: value.to,
                interpolation: {
                    escapeValue: false
                }
            });
        }

        return value;
    };

    const stripedGlobalValues = globalValues.map(stringifyValue);
    const stripedCalculatedValue = stringifyValue(calculatedValue);

    return (
        <KitTabs
            items={[
                {
                    key: 'version_values',
                    label: t('record_summary.values_version'),
                    tabContent: (
                        <InformationsWrapper>
                            <KitTree
                                defaultExpandAll
                                selectedKeys={
                                    calculatedValue && globalValues.length === 0
                                        ? [calculatedValueKey]
                                        : [globalValueKey]
                                }
                                treeData={[
                                    {
                                        key: calculatedValueKey,
                                        title: (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <span>
                                                    <FaSquareRootAlt /> {t('record_summary.calculated_value')}
                                                </span>
                                                <KitBadge
                                                    count={stripedCalculatedValue ? 1 : undefined}
                                                    color="primary"
                                                />
                                            </div>
                                        ),
                                        children: [
                                            {
                                                key: `${calculatedValueKey}-0`,
                                                title: stripedCalculatedValue ?? <i>{t('record_summary.no_value')}</i>
                                            }
                                        ]
                                    },
                                    {
                                        key: globalValueKey,
                                        title: (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <span>
                                                    <FaLayerGroup /> {t('record_summary.global')}
                                                </span>
                                                <KitBadge count={stripedGlobalValues.length} color="primary" />
                                            </div>
                                        ),
                                        children:
                                            stripedGlobalValues.length > 0
                                                ? stripedGlobalValues.map((value, index) => ({
                                                      key: `${globalValueKey}-${index}`,
                                                      title: value
                                                  }))
                                                : [
                                                      {
                                                          key: `${globalValueKey}-${0}`,
                                                          title: <i>{t('record_summary.no_value')}</i>
                                                      }
                                                  ]
                                    }
                                ]}
                            />
                        </InformationsWrapper>
                    )
                }
            ]}
        />
    );
};

export default ValuesSummary;
