import EventManager, { EventType } from "../modules/eventManager/eventManager";
import Global from "../modules/global";
import ResManager from "../modules/resManager/resManager";
import DebugUtil, { DebugKey } from "../modules/debugUtil";
import SoundsManager from "../modules/soundManager";
import { SceneRes } from "../common/commonVar";
import DataManager from "../modules/dataManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class IndexScene extends cc.Component {

    @property({
        type: SceneRes,
        displayName: "全局资源"
    })
    private globalRes: SceneRes = new SceneRes();

    @property({
        type: SceneRes,
        displayName: "该场景要使用的资源"
    })
    private sceneRes: SceneRes = new SceneRes();

    private eventMgr: EventManager = null;
    onLoad() {
        this.eventMgr = EventManager.ins;

        this.onEvent();
    }

    start() {
        if (!Global.ins.isRecordGlobalRes) {
            let recordArr: Function = function (arr: cc.Asset[]) {
                let a: cc.Asset;
                for (a of arr)
                    ResManager.ins.recordUse(a, "global");
            }

            if (this.globalRes.audioArr.length > 0)
                recordArr(this.globalRes.audioArr);
            if (this.globalRes.jsonArr.length > 0)
                recordArr(this.globalRes.jsonArr);
            if (this.globalRes.prefabArr.length > 0)
                recordArr(this.globalRes.prefabArr);


            DataManager.ins.initData();
            Global.ins.isRecordGlobalRes = true;
        }

        SoundsManager.ins.playBGM("sounds/BGM.mp3");

        this.scheduleOnce(() => {
            ResManager.ins.outputCurResNum();
        }, 2);
    }

    private onEvent() {
        this.eventMgr.onEventOnce(EventType.LoadGameScene, this.loadLevel, this);
    }

    private loadLevel() {
        let n: string = "level" + Global.ins.curLevelNum;
        EventManager.ins.sendEvent(EventType.OpenLoadPage);
        DebugUtil.ins.log(DebugKey.GameLogic, `加载场景${n}`);
        ResManager.ins.switchScene(n);
    }


    /* ---------------------UI绑定的事件------------------------------ */
    startBut() {
        this.eventMgr.sendEvent(EventType.OpenSelectLevelPanel);
    }

    backBut() {
        this.eventMgr.sendEvent(EventType.CloseSelectLevelPanel);
    }

}