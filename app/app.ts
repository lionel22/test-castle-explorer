import * as express from "express";
import {CastleExplorer} from "./modules/CastleExplorer";
import * as dotenv from "dotenv";

dotenv.config();

class App {

    public app: express.Application;

    constructor() {
        this.app = express();

        let castleDoor: string = `${process.env.CASTLE_DOOR}`;
        let linkBase: string = `${process.env.LINK_BASE}`;
        let castleExplorer: CastleExplorer = new CastleExplorer(castleDoor, linkBase);

        castleExplorer.explore()
    }
}

export default new App().app;