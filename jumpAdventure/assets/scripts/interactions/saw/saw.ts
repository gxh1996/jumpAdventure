import { Segment, HitData, WrapMode } from "../../common/commonVar";
import SawBg from "./sawBg";
import MathUtil from "../../common/mathUtil";
import EventManager, { EventType } from "../../modules/eventManager/eventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Saw extends cc.Component {

    @property({ displayName: "停靠时间" })
    private dockT: number = 2;

    @property()
    private force: number = 50;

    @property()
    private speed: number = 1;

    @property({ tooltip: "没有动画，固定的" })
    private fixed: boolean = false;

    private anim: SawBg = null;
    private ct: number = 0;
    private isDocking: boolean = false;

    onLoad() {
        this.anim = this.node.getComponent("sawBg");
        let self = this;
        EventManager.ins.onEvent(EventType.InitGameScene, () => {
            self.anim.setup(self.speed, self.fixed);
        }, this);
        this.node.on("arriveP", () => {
            self.anim.pauseMove();
            self.ct = 0;
            self.isDocking = true;
        }, this);
        this.node.on("onBeginContact", this._onBeginContact, this);
    }


    private _onBeginContact(e: cc.Event.EventCustom) {
        e.stopPropagation();

        let c: cc.PhysicsContact = e.detail;
        let wM: cc.WorldManifold = c.getWorldManifold();
        let d: cc.Vec2 = wM.normal;

        let data: HitData = new HitData();
        if (d.x > 0) {
            data.rotate = -MathUtil.getRandomInteger(25, 90);
        }
        else if (d.x > 0) {
            data.rotate = MathUtil.getRandomInteger(25, 90);
        }
        else
            data.rotate = null;

        data.force = cc.v2(this.force * d.x, this.force * d.y);

        EventManager.ins.sendEvent(EventType.Dead, data);
    }

    update(dt) {
        if (this.isDocking) {
            this.ct += dt;
            if (this.ct >= this.dockT) {
                this.isDocking = false;
                this.anim.continueMove();
            }
        }
    }

    onDestroy() {
        EventManager.ins.deleteSubscriber(this);
    }
}
