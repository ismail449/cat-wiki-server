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
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
axios_1.default.defaults.baseURL = "https://api.thecatapi.com/v1";
axios_1.default.defaults.headers.common["x-api-key"] = process.env.API_KEY;
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server is running hot");
});
app.get("/search-bread/:beardName", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = yield (0, axios_1.default)("/breeds");
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
}));
app.get("/get-bread/:breedId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = yield (0, axios_1.default)(`/breeds/${req.params.breedId}`);
    res.send(data);
}));
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    console.log(process.env.API_KEY);
});
