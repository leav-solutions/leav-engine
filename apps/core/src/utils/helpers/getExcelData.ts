import ExcelJS from 'exceljs';

export default async (buffer: Buffer): Promise<string[][][]> => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
    const data: string[][][] = [];

    workbook.eachSheet((s, i) => {
        s.eachRow(r => {
            let elems = (r.values as any[]).slice(1);

            elems = Array.from(elems, e => {
                if (typeof e === 'undefined') {
                    return null; // we replace empty cell value by null
                } else if (typeof e === 'object') {
                    return e.result; // if cell value is a formula
                }

                return e;
            });

            if (typeof data[i - 1] === 'undefined') {
                data[i - 1] = [];
            }

            data[i - 1].push(elems);
        });
    });

    return data; // [ sheets [ lines [ columns ]]]
};
