import WXHelper from "./wxHelper";
import EventManager, { EventType } from "../../modules/eventManager/eventManager";

const { ccclass, property } = cc._decorator;

//排行榜功能
@ccclass
export default class rankingList extends cc.Component {

    @property(cc.WXSubContextView)
    private subConView: cc.WXSubContextView = null;

    onLoad() {
        EventManager.ins.onEventOnce(EventType.InitRankList, this.init, this);
    }

    start() {
        if (typeof wx === "undefined")
            return;
        // this.subConView.enabled = false;
    }

    private init() {
        WXHelper.ins.refreshRankList();
        // this.subConView.update();
        this.hideRankingList();
    }

    /**
     * 显示排行榜
     */
    private showRankingList() {
        console.log("开始显示好友排行榜...");

        WXHelper.ins.refreshRankList()
        this.node.setPosition(cc.v2(0, 0));
        // this.subConView.update();
    }

    /**
     * 隐藏排行榜
     */
    private hideRankingList() {
        console.log("隐藏好友排行榜！");
        this.node.setPosition(cc.v2(800, 0));
    }


}
