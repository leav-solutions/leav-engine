import {IDbService} from '../db/dbService';
import {IAttributeTypeRepo} from '../attributeRepo';
import {IValue} from '_types/value';
import {IAttribute} from '_types/attribute';

const VALUES_LINKS_COLLECTION = 'core_edge_values_links';

export default function(dbService: IDbService | any): IAttributeTypeRepo {
    return {
        async createValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            return null;
        },
        async updateValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            return null;
        },
        async deleteValue(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            return null;
        },
        async getValues(library: string, recordId: number, attribute: IAttribute): Promise<IValue[]> {
            return null;
        },
        async getValueById(library: string, recordId: number, attribute: IAttribute, value: IValue): Promise<IValue> {
            return null;
        }
    };
}
