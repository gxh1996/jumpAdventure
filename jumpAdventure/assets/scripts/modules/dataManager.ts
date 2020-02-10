import { GameConfig, UserData } from "../common/commonVar";
import EventManager, { EventType } from "./eventManager/eventManager";
import DataStorage from "./dataStorage";
import Global from "./global";
import WXHelper from "../indexScene/wx/wxHelper";

/**游戏数据管理类 */
export default class DataManager {

    static ins: DataManager;
    static init() {
        this.ins = new DataManager();
    }

    private eventMgr: EventManager = EventManager.ins;
    /**
     * 关卡信息
     */
    private gameLevel: GameConfig = null;
    /**
     * 用户数据信息
     */
    private userData: UserData = null;

    private constructor() {
        this.eventMgr.onEventOnce(EventType.GotOpenId, this.initUserData, this);
    }

    initData() {
        let json: cc.JsonAsset = cc.loader.getRes("json/gameConfig", cc.JsonAsset);
        this.gameLevel = json.json;

        // this.eventMgr.sendEvent(EventType.InitConfigComplete);

        if (typeof wx === "undefined") {
            json = cc.loader.getRes("json/userData", cc.JsonAsset);
            this.userData = json.json;
            console.log("使用用例用户数据");
            this.eventMgr.sendEvent(EventType.InitUserDataComplete);
        }

    }

    private initUserData() {
        let self = this;
        console.log("initUserData");
        DataStorage.ins.downloadData(Global.ins.openid, (res: UserData) => {
            if (res) {
                self.userData = res;
                console.log("初始化用户数据", res);
                self.eventMgr.sendEvent(EventType.InitUserDataComplete);
            }
            else {
                console.log("用户第一次使用，生成用户数据");
                self.userData = { getStars: [] };
                DataStorage.ins.addData(Global.ins.openid, self.userData);
                self.eventMgr.sendEvent(EventType.InitUserDataComplete);
            }
        })

    }

    /**一共有多少关 */
    get levelSum(): number {
        return this.gameLevel.levelSum;
    }

    /**
     * 通过多少关
     */
    get passLevelSum(): number {
        return this.userData.getStars.length;
    }

    /**
     * 得到该关获得的星星数
     * @param levelNum 
     */
    getLeveledStarN(levelNum: number): number {
        if (levelNum > this.passLevelSum)
            return 0;
        return this.userData.getStars[levelNum - 1];
    }

    /**
     * 刷新用户得到的星星数
     * @param levelNum 关卡号
     * @param starN 得到的星星数
     */
    refreshGetStar(levelNum: number, starN: number) {
        if (!this.userData.getStars[levelNum - 1] || this.userData.getStars[levelNum - 1] < starN) {
            //刷新本地存储
            this.userData.getStars[levelNum - 1] = starN;

            //刷新网上存储
            if (typeof wx !== "undefined")
                this.uploadUserData();

            console.log("更新用户数据", this.userData);
        }
    }

    /**
     * 玩家一共得到了多少个星星
     */
    getedStarSum(): number {
        let s: number = 0;
        let n: number;
        for (n of this.userData.getStars)
            s += n;
        return s;
    }


    /**得到该关要求的最长通过时间 */
    getTimeOfLevel(levelNum: number): number {
        if (levelNum > this.gameLevel.levelEvaluationConditions.length) {
            console.error("没有这关的配置信息!");
            return;
        }
        return this.gameLevel.levelEvaluationConditions[levelNum - 1].time;
    }

    /**该关的水果总数 */
    getFruitSumOfLvel(levelNum: number): number {
        if (levelNum > this.gameLevel.levelEvaluationConditions.length) {
            console.error("没有这关的配置信息!");
            return;
        }
        return this.gameLevel.levelEvaluationConditions[levelNum - 1].fruitSum;
    }

    private uploadUserData() {
        DataStorage.ins.uploadData(Global.ins.openid, this.userData);
        WXHelper.ins.uploadScore(this.getedStarSum());
    }
}
