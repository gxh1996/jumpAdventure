import EventManager, { EventType } from "../modules/eventManager/eventManager";
import DebugUtil, { DebugKey } from "../modules/debugUtil";
import ReviewStar from "../common/reviewStar";
import Global from "../modules/global";
import SwitchBut from "../common/switchBut";
import DataManager from "../modules/dataManager";
import MathUtil from "../common/mathUtil";
import SoundsManager from "../modules/soundManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIEvent extends cc.Component {

    @property(cc.Node)
    private panel: cc.Node = null;
    @property(cc.Label)
    private title: cc.Label = null;
    @property(cc.Node)
    private review: cc.Node = null;
    @property(cc.Node)
    private direction: cc.Node = null;
    @property(cc.Node)
    private indexButton: cc.Node = null;
    @property(cc.Node)
    private resetButton: cc.Node = null;
    @property(cc.Node)
    private nextButton: cc.Node = null;

    @property(cc.Node)
    private bgmButton: cc.Node = null;
    @property(cc.Node)
    private pauseButton: cc.Node = null;

    @property(cc.Layout)
    private butLayout: cc.Layout = null;

    /**按钮位置 */
    private butPoints: cc.Vec2[] = [cc.v2(-130, -90), cc.v2(0, -90), cc.v2(130, -90)]

    private eventMgr: EventManager;
    onLoad() {
        this.eventMgr = EventManager.ins;
        this.eventMgr.onEvent(EventType.ShowFailPanel, this.showFailPanel, this);
        this.eventMgr.onEvent(EventType.ShowWinPanel, this.showWinPanel, this);
    }

    private pauseGame() {
        cc.director.pause();
        this.eventMgr.sendEvent(EventType.OpenPanel, this.panel);

        this.title.node.active = true;
        this.title.string = "游戏暂停";
        this.title.node.color = cc.Color.BLUE;

        this.review.active = false;
        this.direction.active = false;
        this.indexButton.active = true;
        this.resetButton.active = true;
        this.nextButton.active = false;

        this.butLayout.updateLayout();
        // this.indexButton.setPosition(this.butPoints[0]);
        // this.resetButton.setPosition(this.butPoints[2]);
    }

    private continueGame() {
        cc.director.resume();
        this.eventMgr.sendEvent(EventType.ClosePanel, this.panel);
    }

    private resetBut() {
        cc.director.resume();
        DebugUtil.ins.log(DebugKey.GameLogic, "重新加载场景");
        this.eventMgr.sendEvent(EventType.ResetGame);
        this.eventMgr.sendEvent(EventType.ClosePanel, this.panel);
        let but: SwitchBut = this.pauseButton.getComponent("switchBut");
        but.setState(1);
        this.resetButZIndex();
    }

    private indexBut() {
        cc.director.resume();
        this.eventMgr.sendEvent(EventType.LoadIndexScene);
    }

    /**下一关 */
    private nextBut() {
        if (Global.ins.curLevelNum + 1 <= DataManager.ins.levelSum) {
            cc.director.resume();
            this.eventMgr.sendEvent(EventType.ClosePanel, this.panel);
            this.eventMgr.sendEvent(EventType.NextLevel);
            this.resetButZIndex();
        }
    }

    private resetButZIndex() {
        this.pauseButton.zIndex = 1;
        this.bgmButton.zIndex = 1;

    }

    private showFailPanel() {
        this.pauseButton.zIndex = -1;
        this.bgmButton.zIndex = -1;
        this.eventMgr.sendEvent(EventType.OpenPanel, this.panel);

        this.title.node.active = true;
        this.title.string = "再接再励";
        this.title.node.color = cc.Color.RED;

        this.review.active = false;
        this.direction.active = false;
        this.indexButton.active = true;
        this.resetButton.active = true;
        this.nextButton.active = false;

        this.butLayout.updateLayout();
        // this.indexButton.setPosition(this.butPoints[0]);
        // this.resetButton.setPosition(this.butPoints[2]);
    }

    /**
     * @param makeScore 评分[角色没有死亡，在规定时间内过关，满分]
     */
    private showWinPanel(makeScore: number[]) {
        this.pauseButton.zIndex = -1;
        this.bgmButton.zIndex = -1;
        this.eventMgr.sendEvent(EventType.OpenPanel, this.panel);

        this.title.node.active = true;
        this.title.string = "游戏成功";
        this.title.node.color = cc.Color.YELLOW;

        this.review.active = true;
        this.direction.active = true;
        this.indexButton.active = true;
        this.resetButton.active = true;
        if (Global.ins.curLevelNum < DataManager.ins.levelSum)
            this.nextButton.active = true;

        this.butLayout.updateLayout();
        // this.indexButton.setPosition(this.butPoints[0]);
        // this.resetButton.setPosition(this.butPoints[1]);
        // this.nextButton.setPosition(this.butPoints[2]);

        DataManager.ins.refreshGetStar(Global.ins.curLevelNum, MathUtil.sumOfArray(makeScore));
        this.setEvaluate(makeScore);
    }

    /**设置评价 */
    private setEvaluate(data: number[]) {
        for (let i = 0; i < data.length; i++) {
            this.setStar(this.review.children[i], data[i]);
            this.setDirection(this.direction.children[i], data[i]);
        }
    }

    /**
     * 设置星星状态
     * @param node 
     * @param dir 1为得到
     */
    private setStar(node: cc.Node, dir: number) {
        if (dir === 1)
            node.opacity = 255;
        else
            node.opacity = 50;
    }

    /**
     * 设置说明样式
     * @param node 
     * @param dir 1为满足条件
     */
    private setDirection(node: cc.Node, dir: number) {
        if (dir === 1)
            node.color = cc.Color.GREEN;
        else
            node.color = cc.Color.RED;
    }

    private openSound() {
        SoundsManager.ins.openSound();
    }

    private closeSound() {
        SoundsManager.ins.closeSound();
    }

    onDestroy() {
        EventManager.ins.deleteSubscriber(this);
    }

}
