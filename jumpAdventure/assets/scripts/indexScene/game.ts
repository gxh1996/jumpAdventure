import DebugUtil, { DebugKey } from "../modules/debugUtil";
import DataManager from "../modules/dataManager";
import DataStorage from "../modules/dataStorage";
import EventManager, { EventType } from "../modules/eventManager/eventManager";
import Global from "../modules/global";
import UIHelper from "../modules/UIHelper";
import ResManager from "../modules/resManager/resManager";
import WXLogin from "./wx/wxLogin";
import WXCloud from "./wx/wxCloud";
import WXHelper from "./wx/wxHelper";
import SoundsManager from "../modules/soundManager";


/****************************************************************************************
*                                        启动脚本                                         *
****************************************************************************************/

const { ccclass, property } = cc._decorator;

@ccclass
export default class Game extends cc.Component {

    onLoad() {
        if (Global.ins.isSetup)
            return;

        this.initModule();

        this.recordFirstSceneRes();
        if (typeof wx !== "undefined") {
            WXLogin.ins.updateVersion();
        }

        Global.ins.isSetup = true;
    }

    /**
     * 初始化模块
     */
    private initModule() {
        EventManager.init();
        DataManager.init();
        DebugUtil.init();
        DataStorage.init();
        UIHelper.init();
        ResManager.init();
        SoundsManager.init();

        //微信
        if (typeof wx !== "undefined") {
            WXHelper.init();
            WXLogin.init();
            WXCloud.init("release-q9a9t");
        }

        this.openDebugKey();
        DebugUtil.ins.log(DebugKey.GameLogic, "初始化模块完成");
    }

    /**记录首场景资源 */
    private recordFirstSceneRes() {
        ResManager.ins.recordCurSceneResUses();
    }

    private openDebugKey() {
        // DebugUtil.ins.openDebug(DebugKey.GameLogic);
        // DebugUtil.ins.openDebug(DebugKey.LoadPage);
        // DebugUtil.ins.openDebug(DebugKey.MovedPlatformBg);
        // DebugUtil.ins.openDebug(DebugKey.RockHead);
        // DebugUtil.ins.openDebug(DebugKey.ClickButton);
        // DebugUtil.ins.openDebug(DebugKey.PlayerState);
    }

}
