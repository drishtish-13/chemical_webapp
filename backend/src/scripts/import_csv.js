const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const sequelize = require("../config/database");
const Compound = require("../models/compound");
require("dotenv").config();

const FILE = path.join(__dirname, "..", "..", "compounds.csv");

(async () => {
  try {
    await sequelize.authenticate();
    console.log("? DB connected");
  } catch (err) {
    console.error("DB auth failed:", err && err.message ? err.message : err);
    process.exit(1);
  }

  if (!fs.existsSync(FILE)) {
    console.error("? CSV file not found at", FILE);
    process.exit(1);
  }

  const rows = [];
  fs.createReadStream(FILE)
    .pipe(csv())
    .on("data", (data) => rows.push(data))
    .on("end", async () => {
      console.log(`Found ${rows.length} rows in CSV. Importing...`);
      let created = 0;
      for (const r of rows) {
        // map your CSV headers to our model fields (without modifying the CSV)
        const name = (r.CompoundName || r.Compoundname || r.Compound_Name || r.name || "").toString().trim();
        const image = (r.strImageSource || r.strImage_URL || r.strImage || r.image || "").toString().trim();
        // prefer description column, fallback to image attribution if description missing
        const description = (r.CompounrDescription || r.CompoundDescription || r.description || r.strImageAttribution || "").toString().trim();

        if (!name || !image) {
          console.log("Skipping invalid row (missing name or image):", JSON.stringify({ name, image }));
          continue;
        }

        try {
          const [instance, wasCreated] = await Compound.findOrCreate({
            where: { name },
            defaults: { image, description }
          });
          if (wasCreated) {
            console.log("Created:", name);
            created += 1;
          } else {
            console.log("Already exists, skipping:", name);
          }
        } catch (err) {
          console.error("Failed to handle row:", name, "error:", err && err.message ? err.message : err);
        }
      }
      console.log(`? Imported ${created} compounds`);
      process.exit(0);
    });
})();
