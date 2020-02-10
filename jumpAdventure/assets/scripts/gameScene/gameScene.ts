import EventManager, { EventType } from "../modules/eventManager/eventManager";
import DebugUtil, { DebugKey } from "../modules/debugUtil";
import ResManager from "../modules/resManager/resManager";
import Global from "../modules/global";
import { SceneRes } from "../common/commonVar";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameScene extends cc.Component {

    @property({
        type: SceneRes,
        displayName: "该场景要使用的资源"
    })
    private sceneRes: SceneRes = new SceneRes();

    onLoad() {
        EventManager.ins.onEvent(EventType.PlayerOutFace, this.gameFail, this);
        EventManager.ins.onEvent(EventType.LoadIndexScene, this.loadIndexScene, this);
        EventManager.ins.onEvent(EventType.ResetGame, this.resetGame, this);
        EventManager.ins.onEvent(EventType.NextLevel, this.nextLevel, this);
    }

    start() {
        this.initGameScene();
        this.scheduleOnce(() => {
            ResManager.ins.outputCurResNum();
        }, 2);
    }

    private initGameScene() {
        EventManager.ins.sendEvent(EventType.InitCamera);
        EventManager.ins.sendEvent(EventType.InitPlayer);
        EventManager.ins.sendEvent(EventType.InitScoreMgr);
        EventManager.ins.sendEvent(EventType.InitGameScene);
    }

    private gameFail() {
        EventManager.ins.sendEvent(EventType.ShowFailPanel);
    }

    private loadIndexScene() {
        DebugUtil.ins.log(DebugKey.GameLogic, "加载主页场景");
        EventManager.ins.sendEvent(EventType.OpenLoadPage);
        ResManager.ins.switchScene("indexScene");
    }

    private resetGame() {
        cc.director.loadScene("level" + Global.ins.curLevelNum);
    }

    private nextLevel() {
        let self = this;
        Global.ins.curLevelNum++;

        EventManager.ins.sendEvent(EventType.OpenLoadPage);
        ResManager.ins.switchScene("level" + Global.ins.curLevelNum);
    }

    onDestroy() {
        EventManager.ins.deleteSubscriber(this);
    }
}
