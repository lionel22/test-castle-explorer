import * as moment from "moment";

const Crawler = require("crawler");

export class CastleExplorer {
    start: moment.Moment;
    endRoom: moment.Moment;
    castleDoor: string;
    linkBase: string;
    fullChestCount: number = 0;
    roomsCount: number = 0;
    chestsCount: number = 0;
    fullChestLink: string[] = [];
    roomCrawler: any;
    chestCrawler: any;

    constructor(castleDoor: string, linkBase: string) {
        this.castleDoor = castleDoor;
        this.linkBase = linkBase;
        this.roomCrawler = new Crawler({
            maxConnections: process.env.MAX_CONNECTIONS_ROOM,
            jQuery: false,
            json: true,
            retries: 100,
            callback: this.roomExplorerCallbackClosure()
        });
        this.chestCrawler = new Crawler({
            maxConnections: process.env.MAX_CONNECTIONS_CHEST,
            jQuery: false,
            json: true,
            retries: 100,
            callback: this.chestExplorerCallbackClosure()
        });
    }

    public explore() {
        this.start = moment();
        this.exploreItem(this.castleDoor, this.roomCrawler);
        this.chestCrawler.on('drain', this.chestEventDrainCallbackClosure());
        this.roomCrawler.on('drain', this.roomEventDrainCallbackClosure());
    }


    private async exploreItem(link: string, crawler: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            crawler.queue(link);
            return resolve('anything');
        })
    }

    private async exploreItems(links: string[] = [], crawler: any): Promise<any> {
        return await Promise.all(links.map(link => {
            return this.exploreItem(`${this.linkBase}${link}`, crawler);
        }))
    }

    private roomEventDrainCallbackClosure(): Function {
        return () => {
            let end = moment();
            this.endRoom = end;
           // console.log(`took: ${end.diff(this.start, 'minutes')} minutes`);
            console.log('end roomCrawler');
        }
    }

    private chestEventDrainCallbackClosure(): Function {
        return () => {
            let end = moment();
            console.log(`took: ${end.diff(this.start, 'minutes')} minutes`);
            console.log('end chestCrawler. Save json, send event or call callback, whatever you want.');
            console.log(`fullChestCount: ${this.fullChestCount}, chestsCount: ${this.chestsCount}, roomsCount: ${this.roomsCount}`);
        }
    }

    private roomExplorerCallbackClosure() {
        return (error: any, res: any, done: any) => {
            if (error) {
                console.log('oups  error ', error);
            } else {
                let room: Room = res.body;
                this.exploreItems(room.rooms, this.roomCrawler);
                this.exploreItems(room.chests, this.chestCrawler);
                ++this.roomsCount;
               // console.log(`roomId : ${room.id}, roomsCount: ${this.roomsCount}`);
            }
            done();
        }
    }

    private chestExplorerCallbackClosure() {
        return (error: any, res: any, done: any) => {
            if (error) {
                console.log('oups  error ', error);
            } else {
                let chest: Chest = res.body;
                if (chest.status === "It looks like there is something here!") {
                    ++this.fullChestCount;
                    this.fullChestLink.push(res.options.uri);
                }
                let end = moment();
                let endRoom = this.endRoom || end;
                ++this.chestsCount;
                console.log(`chestId : ${chest.id}, fullChestCount: ${this.fullChestCount}, chestsCount: ${this.chestsCount}, roomsCount: ${this.roomsCount}, chests time: ${end.diff(this.start, 'minutes')} minutes, rooms time: ${endRoom.diff(this.start, 'minutes')} minutes`);
            }
            done();
        }
    }
}

export interface Room {
    id: string;
    rooms: string[];
    chests: string[];
}

export interface Chest {
    id: string;
    status: string;
}