import FrameAnimation from "../common/frameAnim";
import EventManager, { EventType } from "../modules/eventManager/eventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Arrow extends cc.Component {

    @property(cc.SpriteAtlas)
    private hitAtlas: cc.SpriteAtlas = null;

    @property(FrameAnimation)
    private anim: FrameAnimation = null;

    @property()
    private upForce: number = 80;

    @property(cc.RigidBody)
    private rigid: cc.RigidBody = null;

    start() {

    }

    onBeginContact(contact: cc.PhysicsContact, self: cc.Collider, other: cc.Collider) {
        if (other.node.group === "PLAYER") {
            EventManager.ins.sendEvent(EventType.ChangeSpeedYPlayer, 0);
            EventManager.ins.sendEvent(EventType.ApplyImpulsionToPlayer, cc.v2(0, this.upForce));
            this.active();
            this.rigid.enabledContactListener = false;
        }
    }

    /**
     * 播放激活动画
     */
    private active() {
        this.anim.stop();
        this.anim.setSpriteAtlas(this.hitAtlas);
        this.anim.play(false, (() => {
            this.node.destroy();
        }).bind(this));
    }
}
