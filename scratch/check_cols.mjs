import { neon } from '@neondatabase/serverless';
import fs from 'fs';
const u = fs.readFileSync('.env', 'utf8').split('\n')[0].replace('DATABASE_URL=', '').trim();
const s = neon(u);
const cols = await s`select column_name, data_type from information_schema.columns where table_name='products'`;
console.log(cols.map(r => r.column_name + ':' + r.data_type).join(', '));
