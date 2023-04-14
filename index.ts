import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from Express and TypeScript");
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`App listening on PORT ${port}`));
