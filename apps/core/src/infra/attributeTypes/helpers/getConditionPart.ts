// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {aql, AqlLiteral, AqlQuery, GeneratedAqlQuery} from 'arangojs/lib/cjs/aql-query';
import moment from 'moment';
import {AttributeFormats, IAttribute} from '../../../_types/attribute';
import {AttributeCondition, IDateFilterValue} from '../../../_types/record';

export type GetConditionPart = (
    valueIdentifier: string | AqlLiteral | AqlQuery, // FIXME: tmp let aqlquery only
    condition: AttributeCondition,
    value: string | number | boolean,
    attribute: IAttribute
) => GeneratedAqlQuery;

export default function (): GetConditionPart {
    return (
        valueIdentifier: string | AqlLiteral | AqlQuery, // FIXME: tmp let aqlquery only
        condition: AttributeCondition,
        value: string | number | boolean | IDateFilterValue,
        attribute: IAttribute
    ): GeneratedAqlQuery => {
        const valueField = typeof valueIdentifier === 'string' ? aql.literal(valueIdentifier) : valueIdentifier;
        // const valueField = valueIdentifier;

        switch (condition) {
            case AttributeCondition.EQUAL: {
                const cond =
                    attribute.format === AttributeFormats.DATE
                        ? aql`DATE_COMPARE(${valueField} * 1000, ${Number(value) * 1000}, "years", "days") == true`
                        : aql`${valueField} == ${value}`;

                return cond;
            }
            case AttributeCondition.NOT_EQUAL:
                return attribute.format === AttributeFormats.DATE
                    ? aql`DATE_COMPARE(${valueField} * 1000, ${Number(value) * 1000}, "years", "days") == false`
                    : aql`${valueField} != ${value}`;
            case AttributeCondition.BEGIN_WITH:
                return aql`${valueField} LIKE ${`${value}%`}`;
            case AttributeCondition.END_WITH:
                return aql`${valueField} LIKE ${`%${value}`}`;
            case AttributeCondition.CONTAINS: {
                return attribute.format === AttributeFormats.DATE_RANGE
                    ? aql`${Number(value)} >= ${valueField}.from AND ${Number(value)} <= ${valueField}.to`
                    : aql`${valueField} LIKE ${`%${value}%`}`;
            }
            case AttributeCondition.NOT_CONTAINS:
                return aql`${valueField} NOT LIKE ${`%${value}%`}`;
            case AttributeCondition.GREATER_THAN:
                return aql`${valueField} > ${Number(value)}`;
            case AttributeCondition.LESS_THAN:
                return aql`${valueField} != null AND ${valueField} < ${Number(value)}`;
            case AttributeCondition.IS_EMPTY:
                return aql`${valueField} == null`;
            case AttributeCondition.IS_NOT_EMPTY:
                return aql`${valueField} != null`;
            case AttributeCondition.BETWEEN:
                return aql`(
                            ${valueField} >= ${Number((value as IDateFilterValue).from)}
                            AND ${valueField} <= ${Number((value as IDateFilterValue).to)}
                        )`;
            case AttributeCondition.TODAY:
                return aql`DATE_COMPARE(${valueField} * 1000, DATE_NOW(), "years", "days") == true`;
            case AttributeCondition.YESTERDAY:
                return aql`DATE_COMPARE(
                            ${valueField} * 1000,
                            DATE_SUBTRACT(DATE_NOW(), 1, "day"),
                            "years",
                            "days"
                        ) == true`;
            case AttributeCondition.TOMORROW:
                return aql`DATE_COMPARE(
                            ${valueField} * 1000,
                            DATE_ADD(DATE_NOW(), 1, "day"),
                            "years",
                            "days"
                        ) == true`;
            case AttributeCondition.NEXT_MONTH: {
                const now = moment().unix();
                const nextMonth = moment().add(31, 'days').unix();
                return aql`${valueField} >= ${now} AND ${valueField} <=${nextMonth}`;
            }
            case AttributeCondition.LAST_MONTH: {
                const now = moment().unix();
                const lastMonth = moment().subtract(31, 'days').unix();
                return aql`${valueField} >= ${lastMonth} AND ${valueField} <=${now}`;
            }
            case AttributeCondition.START_ON:
                return aql`DATE_COMPARE(${valueField}.from * 1000, ${Number(value) * 1000}, "years", "days") == true`;
            case AttributeCondition.START_BEFORE:
                return aql`${valueField}.from != null AND ${valueField}.from < ${Number(value)}`;
            case AttributeCondition.START_AFTER:
                return aql`${valueField}.from > ${Number(value)}`;
            case AttributeCondition.END_ON:
                return aql`DATE_COMPARE(${valueField}.to * 1000, ${Number(value) * 1000}, "years", "days") == true`;
            case AttributeCondition.END_BEFORE:
                return aql`${valueField}.to != null AND ${valueField}.to < ${Number(value)}`;
            case AttributeCondition.END_AFTER:
                return aql`${valueField}.to > ${Number(value)}`;
            default:
                return aql`${valueField} == ${value}`;
        }
    };
}
