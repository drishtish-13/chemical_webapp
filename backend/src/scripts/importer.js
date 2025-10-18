// src/scripts/importer.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Compound = require('../models/compound');

module.exports.importIfEmpty = async function importIfEmpty() {
  const count = await Compound.count();
  if (count > 0) {
    return { skipped: true, reason: 'table not empty', count };
  }

  const FILE = path.join(__dirname, '..', '..', 'compounds.csv'); // adjust path if needed
  if (!fs.existsSync(FILE)) return { skipped: true, reason: 'csv-not-found' };

  const rows = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(FILE)
      .pipe(csv())
      .on('data', (data) => rows.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  let created = 0;
  for (const r of rows) {
    // map your CSV headers safely (supports both kinds you had)
    const name = (r.CompoundName || r.Compoundname || r.Compound_Name || r.name || '').toString().trim();
    const image = (r.strImageSource || r.strImage_URL || r.strImage || r.image || '').toString().trim();
    const description = (r.CompounrDescription || r.CompoundDescription || r.description || r.strImageAttribution || '').toString().trim();
    if (!name || !image) continue;
    try {
      await Compound.create({ name, image, description });
      created++;
    } catch (e) {
      // optionally log per-row errors to console or file
      console.error('seed row failed:', name, e.message || e);
    }
  }
  return { skipped: false, created, totalRows: rows.length };
};
