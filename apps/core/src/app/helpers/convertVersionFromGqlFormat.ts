import {type IValueVersion, type IValueVersionFromGql} from '../../_types/value';

export type ConvertVersionFromGqlFormatFunc = (version: IValueVersionFromGql) => IValueVersion;

export default function () {
    const convertVersionFromGqlFormat: ConvertVersionFromGqlFormatFunc = version =>
        Array.isArray(version) && version.length
            ? version.reduce((formattedVers, valVers) => {
                  formattedVers[valVers.treeId] = valVers.treeNodeId;
                  return formattedVers;
              }, {})
            : null;
    return convertVersionFromGqlFormat;
}
