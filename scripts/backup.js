const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function backup() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'projectgizi'
  });

  console.log('Connecting to database...');

  const [tables] = await conn.execute('SHOW TABLES');
  const tableNames = tables.map(t => Object.values(t)[0]);

  console.log('Tables: ' + tableNames.join(', '));

  let sql = '-- =============================================\n';
  sql += '-- Backup Database: projectgizi\n';
  sql += '-- Date: ' + new Date().toISOString() + '\n';
  sql += '-- =============================================\n\n';
  sql += 'SET FOREIGN_KEY_CHECKS=0;\n\n';

  for (const table of tableNames) {
    const [rows] = await conn.execute('SELECT * FROM ' + table);
    const [createRows] = await conn.execute('SHOW CREATE TABLE ' + table);
    sql += 'DROP TABLE IF EXISTS ' + table + ';\n';
    sql += createRows[0]['Create Table'] + ';\n\n';

    if (rows.length > 0) {
      const cols = Object.keys(rows[0]);
      for (const row of rows) {
        const vals = cols.map(c => {
          const v = row[c];
          if (v === null || v === undefined) return 'NULL';
          if (typeof v === 'number') return v;
          return "'" + String(v).replace(/'/g, "''") + "'";
        });
        sql += 'INSERT INTO ' + table + ' (' + cols.join(',') + ') VALUES (' + vals.join(',') + ');\n';
      }
      sql += '\n';
    }
  }

  sql += 'SET FOREIGN_KEY_CHECKS=1;\n';

  const dir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const file = path.join(dir, 'projectgizi_backup_' + ts + '.sql');
  fs.writeFileSync(file, sql);

  const sizeKB = (fs.statSync(file).size / 1024).toFixed(1);

  console.log('\n=============================================');
  console.log('  BACKUP BERHASIL');
  console.log('=============================================');
  console.log('File: ' + file);
  console.log('Size: ' + sizeKB + ' KB');
  console.log('Tables: ' + tableNames.length);
  console.log('=============================================');

  await conn.end();
}

backup().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
