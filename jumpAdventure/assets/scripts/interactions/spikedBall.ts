import EventManager, { EventType } from "../modules/eventManager/eventManager";
import { WrapMode } from "../common/commonVar";

const { ccclass, property } = cc._decorator;


@ccclass
export default class SpikedBall extends cc.Component {

    @property()
    private speed: number = 1;

    @property(cc.AnimationClip)
    private clip: cc.AnimationClip = null;

    @property({
        type: cc.Enum(WrapMode),
        tooltip: "动画播放类型"
    })
    private wrapMode: cc.WrapMode = cc.WrapMode.Default;

    private anim: cc.Animation = null;
    private animState: cc.AnimationState = null;
    onLoad() {
        this.anim = this.node.getComponent(cc.Animation);

        this.init();
    }

    private init() {
        this._initAnim();
        this.animState.play();

        if (this.wrapMode !== cc.WrapMode.Default)
            this.animState.wrapMode = this.wrapMode;
    }
    /**
     * 初始化动画
     */
    private _initAnim() {
        this.anim.addClip(this.clip);
        this.animState = this.anim.getAnimationState(this.clip.name);
        this.animState.speed = this.speed;
    }


    onBeginContact(c: cc.PhysicsContact, s, o: cc.PhysicsBoxCollider) {
        if (o.node.group === "PLAYER") {
            EventManager.ins.sendEvent(EventType.CanRotate);
            EventManager.ins.sendEvent(EventType.Dead);
        }
    }

    onDestroy() {
        if (this.animState)
            this.animState.stop();
    }
}
