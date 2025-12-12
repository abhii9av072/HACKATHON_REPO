require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const Item = require("./models/Item");
const Request = require("./models/Request");
const app = express();
connectDB();

app.use(cors());
app.use(express.json({ limit: "10mb" }));


// SEARCH API ROUTE (Fix for borrow page 404 + Unexpected token '<')
app.get("/api/search", async (req, res) => {
    try {
        const query = req.query.q;
        console.log("Search query received:", query);

        if (!query || query.trim() === "") {
            return res.json([]); // Return empty list if no search term
        }

        const items = await Item.find({
            title: { $regex: query, $options: "i" }  // Case-insensitive search
        });

        return res.json(items);
    } catch (error) {
        console.error("Search Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


app.use("/api/auth", require("./routes/auth"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/borrow", require("./routes/borrow"));
app.use("/api/lend", require("./routes/lend"));
app.use("/api/leaderboard", require("./routes/leaderboard"));
app.use("/api/requests", require("./routes/requests"));
app.use("/api/search", require("./routes/search"));
    

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
