import express, { Express, Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

axios.defaults.baseURL = "https://api.thecatapi.com/v1";
axios.defaults.headers.common["x-api-key"] = process.env.API_KEY;

const app: Express = express();
const port = process.env.PORT || 5000;

type Breed = {
  id: string;
  name: string;
};

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server is running hot");
});

app.get("/search-bread/:beardName", async (req: Request, res: Response) => {
  const { data } = await axios<Breed[]>("/breeds");
  const breadName = req.params.beardName;

  const filteredBreads = data.filter((breed) => {
    return breed.name
      .toLocaleLowerCase()
      .includes(breadName.toLocaleLowerCase());
  });
  const newFilteredBreeds = filteredBreads.map((breed) => {
    return { name: breed.name, id: breed.id };
  });
  res.send(newFilteredBreeds);
});

app.get("/get-bread/:breedId", async (req: Request, res: Response) => {
  const { data } = await axios<Breed>(`/breeds/${req.params.breedId}`);
  res.send(data);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  console.log(process.env.API_KEY);
});
