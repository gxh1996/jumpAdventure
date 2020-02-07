import EventManager, { EventType } from "../modules/eventManager/eventManager";
import DataManager from "../modules/dataManager";
import Global from "../modules/global";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ScoreMgr extends cc.Component {

    @property(cc.Label)
    private scoreLab: cc.Label = null;

    @property(cc.Label)
    private countDownLab: cc.Label = null;

    /**倒计时少于该时间就变成警告样式 */
    private warningTime: number = 20;

    /**计时器 */
    private _ct: number;
    /**换成整数后的计时器 */
    private ct: number;
    /**已收集的水果总数数量 */
    private collectedFruitSum: number;
    private eventMgr: EventManager;

    private isUpdate: boolean = true;
    /**超过规定的通过时间 */
    private outTime: boolean = false;
    /**需要收集的水果总数 */
    private needCollectFruitSum: number;

    onLoad() {
        this.eventMgr = EventManager.ins;

        this.onEvent();
    }

    private onEvent() {
        let self = this;
        this.eventMgr.onEvent(EventType.InitScoreMgr, this.init, this);
        this.eventMgr.onEvent(EventType.AddScore, this.addCollectNum, this);
        this.eventMgr.onEvent(EventType.Dead, () => {
            self.isUpdate = false;
        }, this);
        this.eventMgr.onEvent(EventType.Win, () => {
            self.isUpdate = false;
        }, this);
        this.eventMgr.onEvent(EventType.MakeScore, () => {
            self.eventMgr.sendEvent(EventType.ShowWinPanel, self.makeScore());
        }, this);

    }

    private init() {
        this.needCollectFruitSum = DataManager.ins.getFruitSumOfLvel(Global.ins.curLevelNum);
        this.ct = DataManager.ins.getTimeOfLevel(Global.ins.curLevelNum);
        this._ct = this.ct;
        this.collectedFruitSum = 0;
        this.isUpdate = true;
        this.outTime = false;

        this.refreshShowedCollectedFruit();
        this.refreshTime(this.ct);
    }


    /**增加水果收集的数量 */
    private addCollectNum() {
        this.collectedFruitSum += 1;
        this.refreshShowedCollectedFruit();
    }

    /**刷新显示收集的水果 */
    private refreshShowedCollectedFruit() {
        this.scoreLab.string = `水果:${this.collectedFruitSum}/${this.needCollectFruitSum}`;
    }

    private refreshTime(t: number) {
        if (this.ct < 0)
            this.ct = 0;

        this.countDownLab.string = this.convertSecondToTime(this.ct);
        if (t <= this.warningTime) {
            if (this.countDownLab.node.color !== cc.Color.RED)
                this.countDownLab.node.color = cc.Color.RED;

            this.countDownLab.node.runAction(cc.blink(0.5, 1));
        }
    }

    /**打分 */
    private makeScore(): number[] {
        console.log(`游戏用时：${DataManager.ins.getTimeOfLevel(Global.ins.curLevelNum) - this.ct}，收集水果数:${this.collectedFruitSum}`);

        let s: number[] = [1];
        if (!this.outTime)
            s[1] = 1;

        if (this.collectedFruitSum === this.needCollectFruitSum)
            s[2] = 1;
        else if (this.collectedFruitSum > this.needCollectFruitSum) {
            s[2] = 1;
            console.warn("水果总数量有误，请修改");
        }
        return s;
    }

    update(dt) {
        if (!this.isUpdate || this.outTime)
            return;

        if (this.ct <= 0) {
            this.outTime = true;
            return;
        }

        this._ct -= dt;

        let t: number = this._ct - this._ct % 1;
        if (t < this.ct) {
            this.ct = t;
            this.refreshTime(this.ct);
        }

    }

    /**将秒数转为 00:00字符串 */
    private convertSecondToTime(s: number): string {
        let minute: number;
        let second: number;
        let mStr: string;
        let sStr: string;
        minute = Math.floor(s / 60);
        second = s - minute * 60;

        if (minute < 10)
            mStr = `0${minute}`;
        else
            mStr = minute.toString();
        if (second < 10)
            sStr = `0${second}`;
        else
            sStr = second.toString();

        return `${mStr}:${sStr}`;
    }

    onDestroy() {
        this.eventMgr.deleteSubscriber(this);
    }
}