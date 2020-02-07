import FrameAnimation from "../common/frameAnim";
import EventManager, { EventType } from "../modules/eventManager/eventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Upspring extends cc.Component {

    @property(cc.SpriteAtlas)
    private on: cc.SpriteAtlas = null;

    @property(cc.SpriteFrame)
    private idle: cc.SpriteFrame = null;

    @property({ displayName: "力" })
    private force: number = 80;

    private anim: FrameAnimation = null;

    onLoad() {
        this.anim = this.node.addComponent("frameAnim");
    }

    start() {
        this.init();
    }

    private init() {
        this.anim.setIdleImg(this.idle);
        this.anim.setSpriteAtlas(this.on);

    }

    onBeginContact(c, s, o: cc.PhysicsBoxCollider) {
        if (o.node.group === "PLAYER") {
            if (this.anim.isPlaying())
                return;

            this.anim.play();
            EventManager.ins.sendEvent(EventType.ChangeSpeedYPlayer, 0);
            EventManager.ins.sendEvent(EventType.ApplyImpulsionToPlayer, cc.v2(0, this.force));
        }
    }

    // update (dt) {}
}
