import fs from 'node:fs';
import { parse } from 'csv-parse';
import formidable from 'formidable';

export async function readCsv(req){

    const form = formidable({});
    let fields;
    let files;
    try {
        [fields, files] = await form.parse(req);
    } catch (err) {
        console.error(err);
        res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
        res.end(String(err));
        return;
    }

    const processFile = async () => {
        const records = [];
        const parser = fs
            .createReadStream(files.file[0].filepath)
            .pipe(parse({
                // CSV options if any
            }));
        for await (const record of parser) {
            // Work with each record
            records.push(record);
        }
        return records;
    };
    
    const records = await processFile();
    records.shift();

    return records;
}
