// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IValueVersion, IValueVersionFromGql} from '_types/value';

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
