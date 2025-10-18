const express = require("express");
const app = express();
app.get("/", (req,res) => res.send("test-server ok"));
const PORT = 4000;
app.listen(PORT, () => console.log("test-server listening on", PORT));
