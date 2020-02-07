import EventManager, { EventType } from "../modules/eventManager/eventManager";
import Global from "../modules/global";
import ResManager from "../modules/resManager/resManager";
import DebugUtil, { DebugKey } from "../modules/debugUtil";
import SoundsManager from "../modules/soundManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class IndexScene extends cc.Component {

    private eventMgr: EventManager = null;
    onLoad() {
        this.eventMgr = EventManager.ins;

        this.onEvent();
    }

    start() {
        this.scheduleOnce(() => {
            ResManager.ins.outputCurResNum();
        }, 2);

    }

    private onEvent() {
        this.eventMgr.onEventOnce(EventType.LoadGameScene, this.loadLevel, this);
        this.eventMgr.onEventOnce(EventType.LoadGameConfigComplete, () => {
            console.log("播放背景音乐");
            SoundsManager.ins.playBGM("sounds/BGM.mp3");
        }, this);
    }

    private loadLevel() {

        let n: string = "level" + Global.ins.curLevelNum;
        DebugUtil.ins.log(DebugKey.GameLogic, `加载场景${n}`);
        ResManager.ins.loadScene("gameScene", n);
        EventManager.ins.sendEvent(EventType.OpenLoadPage);
    }


    /* ---------------------UI绑定的事件------------------------------ */
    startBut() {
        this.eventMgr.sendEvent(EventType.OpenSelectLevelPanel);
    }

    backBut() {
        this.eventMgr.sendEvent(EventType.CloseSelectLevelPanel);
    }

}