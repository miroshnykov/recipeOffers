import { createServer } from "http";
import { Server, Socket } from "socket.io";
import * as socketio from "socket.io";
// import {db} from "./db/mysql";
import { FieldPacket, Pool } from 'mysql2/promise';
import { connect } from './db/mysql';
import 'dotenv/config';

import express, {Application, Request, Response, NextFunction} from 'express'
import fs from "fs";
const app: Application = express();
const httpServer = createServer(app);
// import ss  from 'socket.io-stream'
const io = new Server(httpServer, {
    // ...
});

app.get('/recipe', async (req: Request, res: Response) => {

    const conn: Pool = await connect();

    let sql = `
            SELECT o.id                    AS offerId,
                   o.name                  AS name,
                   a.id                    AS advertiserId,
                   a.name                  AS advertiserName,
                   o.advertiser_manager_id AS advertiserManagerId,
                   v.id                    AS verticalId,
                   v.name                  AS verticalName,
                   o.currency_id           AS currencyId,
                   o.status                AS status,
                   o.payin                 AS payin,
                   o.payout                AS payout,
                   o.is_cpm_option_enabled AS isCpmOptionEnabled,
                   o.payout_percent        AS payoutPercent,
                   lp.id                   AS landingPageId,
                   lp.url                  AS landingPageUrl,
                   o.sfl_offer_geo_id      AS sflOfferGeoId,
                   g.rules                 AS geoRules,
                   g.sfl_offer_id          AS geoOfferId,
                   o.conversion_type       AS conversionType,
                   lps.rules               AS customLpRules,
                   c.sfl_offer_id          AS capOfferId,
                   o.use_start_end_date    AS useStartEndDate,
                   o.start_date            AS startDate,
                   o.end_date              AS endDate,
                   o.type
            FROM sfl_offers o
                     left join sfl_offer_landing_pages lp
                               ON lp.id = o.sfl_offer_landing_page_id
                     left join sfl_offer_geo g
                               ON g.sfl_offer_id = o.id
                     left join sfl_offer_custom_landing_pages lps
                               ON o.id = lps.sfl_offer_id
                     left join sfl_advertisers a
                               ON a.id = o.sfl_advertiser_id
                     left join sfl_vertical v
                               ON v.id = o.sfl_vertical_id
                     left join sfl_offers_cap c
                               ON c.sfl_offer_id = o.id
        `
    const [offers]: [any[], FieldPacket[]] = await conn.query(sql);
    conn.end();

    return res.status(200).json(offers);

})


io.on('connection', (socket: Socket) => {
    console.log('connection');
    socket.emit('status', 'Hello from Socket.io');
    // io.to(socket.id).emit("fileSizeInfo","DIMON" )

    // socket.on('sendFileCampaign', async () => {
    //
    //     try {
    //
    //         let filePath = '/tmp/recipe_sfl/offers.json.gz'
    //         let stream = ss.createStream(filePath);
    //         stream.on('end', () => {
    //             console.log(`file:${filePath} sent to soket ID:${socket.id}`);
    //         });
    //         ss(socket).emit('sendingCampaigns', stream);
    //         fs.createReadStream(filePath).pipe(stream);
    //     } catch (e) {
    //         console.log('sendFileCampaignError:', e)
    //     }
    //
    // })

    socket.on('disconnect', () => {
        console.log('client disconnected');
    })
});

io.on('connect', async (socket:Socket) => {
    console.log(`connect id`, socket.id)
})


const host: any = process.env.HOST
const port: any = process.env.PORT
httpServer.listen(port, host, (): void => console.log(`server is running on ${port}`));