"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
axios_1.default.defaults.baseURL = "https://api.thecatapi.com/v1";
axios_1.default.defaults.headers.common["x-api-key"] = process.env.API_KEY;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const uri = process.env.MONGODB_URI || "";
const client = new mongodb_1.MongoClient(uri, {
    serverApi: {
        version: mongodb_1.ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const dbName = "cat_wiki";
const collectionName = "cat-breeds";
const imagesLimit = 10;
app.use((0, cors_1.default)());
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server is running hot");
});
app.get("/search-breeds/:breedName", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield (0, axios_1.default)("/breeds");
        const breedName = req.params.breedName;
        const filteredBreeds = data.filter((breed) => {
            return breed.name
                .toLocaleLowerCase()
                .includes(breedName.toLocaleLowerCase());
        });
        if (filteredBreeds.length === 0) {
            res.status(404).send("Breed NOT Found");
            return;
        }
        const newFilteredBreeds = filteredBreeds.map((breed) => {
            return { name: breed.name, id: breed.id };
        });
        res.send(newFilteredBreeds);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(404).send(error.message);
        }
    }
}));
app.get("/get-breed/:breedId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const breedId = req.params.breedId;
        const { data } = yield (0, axios_1.default)(`/images/search?breed_ids=${breedId}&limit=${imagesLimit}`);
        if (data.length === 0) {
            res.status(404).send("Breed NOT Found");
            return;
        }
        yield client.connect();
        const db = yield client.db(dbName);
        const breedCollection = yield db.collection(collectionName);
        const breed = yield breedCollection.findOne({
            id: breedId,
        });
        let resultBreed = {};
        const breedData = data[0].breeds[0];
        const breedImages = data.map((breed) => {
            delete breed.breeds;
            return breed;
        });
        if (!breed) {
            resultBreed = yield breedCollection.insertOne({
                id: breedData.id,
                breedData,
                searchCount: 1,
                images: breedImages,
            });
        }
        else {
            resultBreed = yield breedCollection.updateOne({ id: breedId }, { $set: { searchCount: breed.searchCount + 1 } });
        }
        yield client.close();
        res.send({
            breedData,
            images: breedImages,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(404).send(error.message);
        }
    }
}));
app.get("/get-top-ten-searched-breeds", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        const db = yield client.db(dbName);
        const topTenSearchedBreeds = yield db
            .collection(collectionName)
            .find({})
            .limit(10)
            .sort({ searchCount: -1 })
            .toArray();
        yield client.close();
        res.send(topTenSearchedBreeds);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(404).send(error.message);
        }
    }
}));
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at Port:${port}`);
});
