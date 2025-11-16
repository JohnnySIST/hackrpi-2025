const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

app.use("/birdcollision", require("./routes/birdcollision"));
app.use("/caterpillar", require("./routes/caterpillar"));
app.use("/spider", require("./routes/spider"));

app.listen(8000, () => {
    console.log("Server running on http://localhost:8000");
});
