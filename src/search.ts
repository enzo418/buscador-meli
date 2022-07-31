import IHttpClient from "./http/IHttpClient";

const random = (min:number, max:number) => {
    return Math.random() * (max - min) + min;
};

const sleep = (ms:number) => new Promise(r => setTimeout(r, ms));


/**
 * Checks if some items are beign selled by a seller id.
 *
 * @async
 * @param {IHttpClient} client
 * @param {string[]} items all the items to check
 * @param {(string | number)} id seller id
 * @param {number} delay delay between requests
 * @returns {Promise<string[]>} all the items found
 */
async function SarchForItemInSeller(
    client: IHttpClient,
    items: string[],
    id: string | number,
    delay: number) : Promise<string[]> {
    
    await sleep(random(delay*0.7, delay*1.3));

    return new Promise(async (resolve, reject) => {
        client.get("/search", {seller_id: id, q: items[0]})
            .then(res => res.json())
            .then(async res => {
                if (res.paging.total === 0) {
                    resolve([]);
                } else {
                    const item = [items[0]];

                    if (items.length === 1) {
                        resolve(item);
                    } else {
                        resolve(item.concat(await SarchForItemInSeller(client, [...items].slice(1), id, delay)));
                    }
                }
            }).catch(e => reject(e));
    });
}

export interface ISearchResult {
    seller_id: string;
    has_all: boolean;
    items_found: string[];
}


/**
 * Gets all the sellers id that sell an item
 *
 * @param {IHttpClient} client
 * @param {string} item_name
 * @param {number} offset
 * @returns {Promise<Set<string>>} ids
 */
function GetIdsOfItemSellers(
    client: IHttpClient,
    item_name: string,
    offset: number) : Promise<Set<string>> {
    return new Promise(async (resolve, reject) => {
        client.get("/search", { q: item_name, offset: offset })
            .then(res => res.json())
            .then(async res => {
                if (res.paging.total === 0) {
                    resolve(new Set());
                }

                let ids: Set<string> = new Set(res.results.map((item: any) => item.seller.id));
                
                if (res.paging.total > res.paging.offset + res.paging.limit) {
                    const ids2 = await GetIdsOfItemSellers(client, item_name, offset + res.paging.limit);
                    ids = new Set(Array.from(ids).concat(Array.from(ids2)));
                }
                
                resolve(ids);
            }).catch(e => reject(e));
    })
}

export default async function SearchMeli(items: string[], client: IHttpClient, delay: number) : Promise<ISearchResult[]> {
    return new Promise(async (resolve, reject) => {
        if (items.length === 0) resolve([]);

        let ids: string[] = [];
        try {
            ids = Array.from(await GetIdsOfItemSellers(client, items[0], 0));
        } catch (error) {
            reject(error);
        }

        const promises = ids.map((seller_id: any) => {
            return new Promise(async (resolve2, reject2) => {
                let has: string[] | null = [items[0]];

                if (items.length > 1) {
                    try {
                        has = has.concat(await SarchForItemInSeller(
                            client,
                            items.slice(1),
                            seller_id,
                            delay
                        ));
                    } catch (error) {
                        reject2(error);
                    }
                }

                if (has != null) {
                    resolve2({ seller_id, has_all: has.length === items.length, items_found: has });
                } else {
                    resolve2({ seller_id, has_all: false, items_found: [] });
                }
            })
        });

        Promise.allSettled(promises).then((p_results) => {
            resolve(p_results.map(p => p.status === "fulfilled" ? p.value : {}) as ISearchResult[]);
        }).catch(e => reject(e));
    });
}