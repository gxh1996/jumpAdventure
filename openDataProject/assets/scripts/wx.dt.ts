
/**托管数据 */
declare interface UserGameData {

    /**用户的微信头像 url*/
    avatarUrl: string;

    /**用户的微信昵称 */
    nickName: string;

    /**用户的openid */
    openid: string;

    /**用户的托管 KV 数据列表 */
    KVDataList: KVData[];
}

declare interface KVData {

    /**数据的key */
    key: string;

    /**数据的value */
    value: string;
}