import express, { Express, Request, Response } from "express";
import { MongoClient, ServerApiVersion } from "mongodb";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

axios.defaults.baseURL = "https://api.thecatapi.com/v1";
axios.defaults.headers.common["x-api-key"] = process.env.API_KEY;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const uri = process.env.MONGODB_URI || "";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const app: Express = express();
const port = process.env.PORT || 5000;

type Breed = {
  id: string;
  name: string;
};
type BreedCount = {
  id: string;
  searchCount: number;
};

const dbName = "cat_wiki";
const collectionName = "cat-breeds";

const isObjectEmpty = (objectName: {}) => {
  return Object.keys(objectName).length === 0;
};

app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server is running hot");
});

app.get("/search-breeds/:beardName", async (req: Request, res: Response) => {
  try {
    const { data } = await axios<Breed[]>("/breeds");
    const breadName = req.params.beardName;

    const filteredBreads = data.filter((breed) => {
      return breed.name
        .toLocaleLowerCase()
        .includes(breadName.toLocaleLowerCase());
    });
    if (filteredBreads.length === 0) {
      res.status(404).send("Breed NOT Found");
      return;
    }
    const newFilteredBreeds = filteredBreads.map((breed) => {
      return { name: breed.name, id: breed.id };
    });
    res.send(newFilteredBreeds);
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).send(error.message);
    }
  }
});

app.get("/get-breed/:breedId", async (req: Request, res: Response) => {
  try {
    const { data } = await axios<Breed>(`/breeds/${req.params.breedId}`);
    if (isObjectEmpty(data)) {
      res.status(404).send("Breed NOT Found");
      return;
    }
    await client.connect();
    const db = await client.db(dbName);
    const breedCollection = await db.collection(collectionName);
    const breedCount = await breedCollection.findOne<BreedCount>({
      id: data.id,
    });
    if (!breedCount) {
      await breedCollection.insertOne({ ...data, searchCount: 1 });
    } else {
      await breedCollection.updateOne(
        { id: data.id },
        { $set: { searchCount: breedCount.searchCount + 1 } }
      );
    }
    await client.close();
    res.send(data);
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).send(error.message);
    }
  }
});

app.get("/get-top-ten-searched-breeds", async (req: Request, res: Response) => {
  try {
    await client.connect();
    const db = await client.db(dbName);
    const topTenSearchedBreeds = await db
      .collection(collectionName)
      .find<BreedCount>({})
      .limit(10)
      .sort({ searchCount: -1 })
      .toArray();

    await client.close();
    res.send(topTenSearchedBreeds);
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).send(error.message);
    }
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
