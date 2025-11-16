const express = require("express");
const router = express.Router();
const Database = require("better-sqlite3");

// Route: /spider
router.get("/", (req, res) => {
    const dbFile = "data/spider.db"; // spider database
    const table = "observations";
    const start = req.query.start;
    const end   = req.query.end;
    const grid  = parseFloat(req.query.grid || 1.0);
    if (!start || !end) {
        return res.status(400).json({
            error: "Parameters 'start' and 'end' are required (YYYY-MM-DD)."
        });
    }
    const db = new Database(dbFile, { readonly: true });
    const sql = `
        SELECT
            FLOOR(longitude / @grid) * @grid AS lon_bin,
            FLOOR(latitude / @grid) * @grid AS lat_bin,
            COUNT(*) AS count
        FROM ${table}
        WHERE observed_on >= @start
          AND observed_on <= @end
          AND latitude IS NOT NULL
          AND longitude IS NOT NULL
        GROUP BY lon_bin, lat_bin
        ORDER BY count DESC;
    `;
    try {
        const stmt = db.prepare(sql);
        const rows = stmt.all({ start, end, grid });
        const result = rows.map(r => ({
            lat: r.lat_bin,
            lon: r.lon_bin,
            count: r.count
        }));
        return res.json({
            start,
            end,
            grid,
            total_bins: result.length,
            points: result
        });
    } catch (err) {
        console.error("SQL error:", err);
        return res.status(500).json({ error: "Database query failed." });
    } finally {
        db.close();
    }
});

module.exports = router;
