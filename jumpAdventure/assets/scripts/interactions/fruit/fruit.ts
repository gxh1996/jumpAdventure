import FrameAnimation from "../../common/frameAnim";
import EventManager, { EventType } from "../../modules/eventManager/eventManager";
import ResManager from "../../modules/resManager/resManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Fruit extends cc.Component {


    @property(FrameAnimation)
    private frameAnim: FrameAnimation = null;

    @property(cc.SpriteAtlas)
    private collectedAtlas: cc.SpriteAtlas = null;

    private atlas: cc.SpriteAtlas = null;
    rigid: cc.RigidBody = null;
    /**
     * 是否被收集
     */
    private isCollected: boolean = false;

    onLoad() {
        this.rigid = this.node.getComponent(cc.RigidBody);
    }

    init(atlas: cc.SpriteAtlas) {
        this.atlas = atlas;
        this.frameAnim.setSpriteAtlas(this.atlas);
        this.frameAnim.play(true);
        this.isCollected = false;
    }

    /**该水果设置为动态刚体 */
    setDynamic() {
        this.rigid.type = cc.RigidBodyType.Dynamic;
    }

    //物理碰撞开始
    onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsBoxCollider, other: cc.PhysicsBoxCollider) {
        if (this.isCollected)
            return;

        if (other.node.group === "PLAYER") {
            //加分
            EventManager.ins.sendEvent(EventType.AddScore);

            //被收集
            this.collected();
            this.isCollected = true;
        }

    }

    /**
     * 被收集
     */
    private collected() {
        this.frameAnim.stop();
        this.frameAnim.setSpriteAtlas(this.collectedAtlas);
        this.frameAnim.play(false, (() => {
            EventManager.ins.sendEvent(EventType.DeleteFruit, this.node);
        }).bind(this));
    }

}
