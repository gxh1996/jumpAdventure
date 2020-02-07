import EventManager, { EventType } from "../modules/eventManager/eventManager";
import DebugUtil, { DebugKey } from "../modules/debugUtil";
import ResManager from "../modules/resManager/resManager";
import Global from "../modules/global";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameScene extends cc.Component {

    @property(cc.Node)
    private gameContent: cc.Node = null;

    private levelPrefab: cc.Prefab = null;

    onLoad() {
        EventManager.ins.onEvent(EventType.PlayerOutFace, this.gameFail, this);
        EventManager.ins.onEvent(EventType.LoadIndexScene, this.loadIndexScene, this);
        EventManager.ins.onEvent(EventType.ResetGame, this.resetGame, this);
        EventManager.ins.onEvent(EventType.NextLevel, this.nextLevel, this);

        this.createLevel();
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

    private createLevel() {
        this.levelPrefab = ResManager.ins.getRes("prefabs/levels/level" + Global.ins.curLevelNum, cc.Prefab);
        this.gameContent.addChild(cc.instantiate(this.levelPrefab));
    }

    private gameFail() {
        EventManager.ins.sendEvent(EventType.ShowFailPanel);
    }

    private loadIndexScene() {
        DebugUtil.ins.log(DebugKey.GameLogic, "加载主页场景");
        ResManager.ins.loadScene("indexScene", "indexScene", () => {
            EventManager.ins.sendEvent(EventType.ResLoadComplete);
        });
    }

    private resetGame() {
        EventManager.ins.sendEvent(EventType.StopCameraFollow);
        let n: cc.Node = this.gameContent.children[0];
        n.removeFromParent();
        n.destroy();
        this.gameContent.addChild(cc.instantiate(this.levelPrefab));
        EventManager.ins.sendEvent(EventType.InitPlayer);
        EventManager.ins.sendEvent(EventType.InitScoreMgr);
        EventManager.ins.sendEvent(EventType.InitGameScene);
        EventManager.ins.sendEvent(EventType.InitCamera);
        EventManager.ins.sendEvent(EventType.OpenCtrlPlayer);

        this.scheduleOnce(() => {
            ResManager.ins.outputCurResNum();
        }, 2);
    }

    private nextLevel() {
        let self = this;
        Global.ins.curLevelNum++;

        EventManager.ins.sendEvent(EventType.OpenLoadPage);
        ResManager.ins.loadNextLevel("level" + Global.ins.curLevelNum, () => {
            self.levelPrefab = ResManager.ins.getRes("prefabs/levels/level" + Global.ins.curLevelNum, cc.Prefab);
            self.resetGame();
            EventManager.ins.sendEvent(EventType.CloseLoadPage);
        });
    }

    onDestroy() {
        EventManager.ins.deleteSubscriber(this);
    }
}
