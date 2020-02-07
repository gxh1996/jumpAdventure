import MathUtil from "../../common/mathUtil";
import DebugUtil, { DebugKey } from "../../modules/debugUtil";
import FrameAnimation from "../../common/frameAnim";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockBg extends cc.Component {

    @property(cc.SpriteAtlas)
    private hitTop: cc.SpriteAtlas = null;

    @property(FrameAnimation)
    private anim: FrameAnimation = null;

    private hited: boolean = false;

    onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsBoxCollider, other: cc.PhysicsBoxCollider) {
        if (this.hited)
            return;
        DebugUtil.ins.log(DebugKey.Block, "block发送碰撞!");

        if (other.node.group === "PLAYER") {
            let dir: number = MathUtil.relativeLocationVertical(self, other);
            if (dir) {
                let rigid: cc.RigidBody = other.node.getComponent(cc.RigidBody);
                if (dir === -1 && rigid.linearVelocity.y < -2 || dir === 1 && rigid.linearVelocity.y > 2) {
                    this.node.dispatchEvent(new cc.Event.EventCustom("hited", true));
                    this.hited = true;
                }
            }
        }
    }

    hit(callFunc: Function) {
        DebugUtil.ins.log(DebugKey.Block, "播放block被破坏动画");

        this.anim.setSpriteAtlas(this.hitTop);
        this.anim.play(false, callFunc);
    }
}
