import FrameAnimation from "../../common/frameAnim";
import MathUtil from "../../common/mathUtil";
import DebugUtil, { DebugKey } from "../../modules/debugUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BoxBg extends cc.Component {


    @property(cc.SpriteFrame)
    private idleImg: cc.SpriteFrame = null;

    @property(cc.SpriteAtlas)
    private hitAtlas: cc.SpriteAtlas = null;


    private anim: FrameAnimation = null;


    onLoad() {
        this.anim = this.node.getComponent("frameAnim");
        this.anim.setIdleImg(this.idleImg);
        this.anim.setSpriteAtlas(this.hitAtlas);
    }

    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsBoxCollider, otherCollider: cc.PhysicsBoxCollider) {
        if (otherCollider.node.group === "PLAYER") {
            let d: number = MathUtil.relativeLocationVertical(otherCollider, selfCollider);
            let rigid: cc.RigidBody = otherCollider.node.getComponent(cc.RigidBody);

            if (d === -1 && rigid.linearVelocity.y > 2 || d === 1 && rigid.linearVelocity.y < -2) {
                DebugUtil.ins.log(DebugKey.Box, "箱子被攻击");

                //向上传递被攻击事件
                this.node.dispatchEvent(new cc.Event.EventCustom("hited", true));
            }

        }
    }

    hit(callBack: Function) {
        DebugUtil.ins.log(DebugKey.Box, "播放箱子被攻击动画");

        this.anim.play(false, callBack);
    }

    // update (dt) {}
}
