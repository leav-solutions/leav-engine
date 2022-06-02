// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {IRecordDomain, IRecordFilterLight} from 'domain/record/recordDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import ExcelJS from 'exceljs';
import {pick} from 'lodash';
import path from 'path';
import * as Config from '_types/config';
import ValidationError from '../../errors/ValidationError';
import {AttributeTypes, IAttribute} from '../../_types/attribute';
import {IQueryInfos} from '../../_types/queryInfos';
import {IRecord} from '../../_types/record';
import {IValue} from '../../_types/value';
import {IValidateHelper} from '../helpers/validate';
import validateLibAttributes from '../library/helpers/validateLibAttributes';

export const DIR_PATH = '/exports';

export interface IExportParams {
    library: string;
    attributes: string[];
    filters?: IRecordFilterLight[];
}

export interface IExportDomain {
    export(params: IExportParams, ctx: IQueryInfos): Promise<string>;
}

interface IDeps {
    'core.domain.record'?: IRecordDomain;
    'core.domain.helpers.validate'?: IValidateHelper;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.value'?: IValueDomain;
    'core.domain.tree'?: ITreeDomain;
    'core.domain.library'?: ILibraryDomain;
    config?: Config.IConfig;
}

export default function ({
    config = null,
    'core.domain.record': recordDomain = null,
    'core.domain.helpers.validate': validateHelper = null,
    'core.domain.attribute': attributeDomain = null,
    'core.domain.library': libraryDomain = null
}: IDeps = {}): IExportDomain {
    const _getFormattedValues = async (
        attribute: IAttribute,
        values: IValue[],
        ctx: IQueryInfos
    ): Promise<IValue[]> => {
        if (attribute.type === AttributeTypes.TREE) {
            values = values.map(v => ({
                ...v,
                value: v.value?.record
            }));
        }

        if (
            attribute.type === AttributeTypes.SIMPLE_LINK ||
            attribute.type === AttributeTypes.ADVANCED_LINK ||
            attribute.type === AttributeTypes.TREE
        ) {
            for (const [i, v] of values.entries()) {
                const recordIdentity = await recordDomain.getRecordIdentity(
                    {id: v.value.id, library: attribute.linked_library || v.value.library},
                    ctx
                );

                values[i].value = recordIdentity.label || v.value.id;
            }
        }

        return values;
    };

    const _extractRecordFieldValue = async (
        record: IRecord,
        attribute: IAttribute,
        asRecord: boolean,
        ctx: IQueryInfos
    ): Promise<IRecord | IRecord[] | IValue | IValue[] | null> => {
        let res = await recordDomain.getRecordFieldValue({
            library: record.library,
            record,
            attributeId: attribute.id,
            ctx
        });

        if (res !== null && asRecord) {
            if (attribute.type === AttributeTypes.TREE) {
                res = Array.isArray(res) ? res.map(e => e.value.record) : res.value.record;
            } else if (
                attribute.type === AttributeTypes.SIMPLE_LINK ||
                attribute.type === AttributeTypes.ADVANCED_LINK
            ) {
                res = Array.isArray(res) ? res.map(e => e.value) : res.value;
            }
        }

        return res;
    };

    const _getRecFieldValue = async (
        elements: Array<IValue | IValue[]> | Array<IRecord | IRecord[]>,
        attributes: string[],
        ctx: IQueryInfos
    ): Promise<Array<IValue | IValue[]>> => {
        if (!attributes.length) {
            return elements;
        }

        const attrProps = await attributeDomain.getAttributeProperties({id: attributes[0], ctx});

        const values = [];
        for (const elem of elements) {
            if (Array.isArray(elem)) {
                for (const e of elem) {
                    const value = await _extractRecordFieldValue(e, attrProps, attributes.length > 1, ctx);
                    if (value !== null) {
                        values.push(value);
                    }
                }
            } else {
                const value = await _extractRecordFieldValue(elem, attrProps, attributes.length > 1, ctx);
                if (value !== null) {
                    values.push(value);
                }
            }
        }

        return _getRecFieldValue(values, attributes.slice(1), ctx);
    };

    return {
        async export({library, attributes, filters}: IExportParams, ctx: IQueryInfos): Promise<string> {
            // separate different depths
            const attrsSplited = attributes.map(a => a.split('.'));
            const firstAttributes = attrsSplited.map(a => a[0]);

            // Validations
            await validateHelper.validateLibrary(library, ctx);
            const err = await validateLibAttributes(firstAttributes, {attributeDomain}, ctx);
            if (Object.keys(err).length) {
                throw new ValidationError(err);
            }

            const records = await recordDomain.find({params: {library, filters}, ctx});

            // Create Excel document
            const workbook = new ExcelJS.Workbook();

            // Set page
            const libAttributes = await libraryDomain.getLibraryProperties(library, ctx);
            const data = workbook.addWorksheet(
                libAttributes?.label[ctx?.lang] || libAttributes?.label[config.lang.default] || library
            );

            // Set columns
            const columns = [];
            const labels = {};
            for (const a of attributes) {
                columns.push({header: a, key: a});
                const attrProps = await attributeDomain.getAttributeProperties({id: a.split('.').pop(), ctx});
                labels[a] = attrProps?.label[ctx?.lang] || attrProps?.label[config.lang.default] || attrProps.id;
            }

            data.columns = columns as ExcelJS.Column[];
            data.addRow(labels);

            for (const record of records.list) {
                // keep only attributes record to export
                const subset = pick(record, firstAttributes);

                for (const attr of attrsSplited) {
                    // get values of full path attribute
                    const fieldValues = await _getRecFieldValue([record], attr, ctx);

                    // get record label or id if last attribute of full path is a link or tree type
                    const attrProps = await attributeDomain.getAttributeProperties({id: attr[attr.length - 1], ctx});
                    const value = await _getFormattedValues(attrProps, fieldValues.flat(Infinity) as IValue[], ctx);

                    // set value(s) and concat them if there are several
                    subset[attr.join('.')] = value.map(v => v.value).join(' | ');
                }

                // Add subset object record on excel row document
                data.addRow(subset);
            }

            const filename = `${library}_${new Date().toLocaleDateString().split('/').join('')}_${Date.now()}.xlsx`;

            await workbook.xlsx.writeFile(`${path.resolve(config.export.directory)}/${filename}`);

            // This is a public URL users will use to retrieve files.
            // It must match the route defined in the server.
            return `${DIR_PATH}/${filename}`;
        }
    };
}
