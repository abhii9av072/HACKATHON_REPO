// Dummy items - replace with DB later
const ITEMS = [
    "Drill Machine",
    "Ladder",
    "Pressure Washer",
    "Camping Tent",
    "Projector",
    "Toolbox",
    "Screwdriver Set",
    "Yoga Mat"
];

exports.searchItem = (req, res) => {
    const q = req.query.q?.toLowerCase() || "";

    const results = ITEMS.filter(item =>
        item.toLowerCase().includes(q)
    );

    res.json({ results });
};

exports.suggestions = (req, res) => {
    const q = req.query.q?.toLowerCase() || "";

    const suggestions = ITEMS.filter(item =>
        item.toLowerCase().startsWith(q)
    ).slice(0, 5);

    res.json({ suggestions });
};
