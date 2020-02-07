import FrameAnimation from "../common/frameAnim";
import { Dir, HitData } from "../common/commonVar";
import MyComponent from "../common/myComponent";
import MathUtil from "../common/mathUtil";
import DebugUtil, { DebugKey } from "../modules/debugUtil";
import EventManager, { EventType } from "../modules/eventManager/eventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Fire extends cc.Component {

    @property(cc.SpriteAtlas)
    private openAtlas: cc.SpriteAtlas = null;

    @property(cc.SpriteFrame)
    private offImg: cc.SpriteFrame = null;

    @property(cc.SpriteAtlas)
    private onAtlas: cc.SpriteAtlas = null;

    @property(FrameAnimation)
    private anim: FrameAnimation = null;

    @property({ displayName: "打开时间" })
    private tOfOpen: number = 1;

    @property({
        type: Dir,
        displayName: "喷射方向"
    })
    private dir: number = Dir.up;

    @property({ displayName: "喷火时间" })
    private duration: number = 2;

    private debugUtil: DebugUtil = DebugUtil.ins;

    /**
     * 火焰区域是否碰撞到角色
     */
    private fireToCollider: cc.PhysicsCollider = null;

    /**
     * 正在喷火
     */
    private isFire: boolean = false;
    /**
     * 正在开启机关
     */
    private isOpen: boolean = false;

    private cT: number = 0;
    private rigid: cc.RigidBody = null;
    private collider: cc.PhysicsBoxCollider = null;
    /**
     * 攻击给与角色的冲力
     */
    private implusion: number = 50;
    /**
     * 附带的偏差力
     */
    private implusionOffset: number = 10;

    onLoad() {
        this.rigid = this.node.getComponent(cc.RigidBody);

        this.collider = this.node.getComponent(cc.PhysicsBoxCollider);
    }
    onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        if (other.node.group === "PLAYER") {
            if (self.tag === 1) {
                this.debugUtil.log(DebugKey.Fire, "火焰区域碰撞到了角色");

                this.fireToCollider = other;
                contact.disabled = true;
            }
            else if (self.tag === 0) {
                this.debugUtil.log(DebugKey.Fire, "非火焰区域碰撞角色");

                if (!this.isOpen) {
                    if (this.isFire)
                        this.cT = 0;
                    else
                        this.open();
                }
            }

            if (this.fireToCollider) {
                if (this.isFire)
                    this.hitPlayer();
                else
                    this.open();
            }
        }
    }

    onEndContact(contact: cc.PhysicsContact, self: cc.PhysicsCollider, other: cc.PhysicsCollider) {
        if (other.node.group === "PLAYER") {
            if (self.tag === 1) {
                this.debugUtil.log(DebugKey.Fire, "角色离开非火焰区域");
                this.fireToCollider = null;
            }
        }
    }

    /**
     * 打开机关
     */
    private open() {
        this.debugUtil.log(DebugKey.Fire, "打开机关");

        this.isOpen = true;
        this.cT = 0;

        this.anim.stop();
        this.anim.setSpriteAtlas(this.openAtlas);
        this.anim.play(true);
    }

    /**
     * 喷火
     */
    private on() {
        this.debugUtil.log(DebugKey.Fire, "喷火");

        this.isOpen = false;
        this.isFire = true;
        this.cT = 0;

        this.anim.stop();
        this.anim.setSpriteAtlas(this.onAtlas);
        this.anim.play(true);

        if (this.fireToCollider)
            this.hitPlayer();
    }

    /**
     * 关闭机关
     */
    private off() {
        this.debugUtil.log(DebugKey.Fire, "关闭机关");

        this.isFire = false;
        this.cT = 0;
        this.anim.stop();
        this.anim.setSpriteFrame(this.offImg);
    }

    /**
     * 攻击到玩家
     */
    private hitPlayer() {
        this.debugUtil.log(DebugKey.Fire, "攻击到角色");

        let data: HitData = new HitData();
        let player: any = this.fireToCollider.getAABB();
        let p: number, s: number;
        let rect: any = this.collider.getAABB();

        switch (this.dir) {
            case Dir.down:
                data.rotate = null;
                data.force = cc.v2(0, -this.implusion);
                break;
            case Dir.left:
                p = player.y + player.height / 2;
                s = rect.y + rect.height / 2;
                if (p > s)
                    data.rotate = -MathUtil.getRandomInteger(30, 45);
                else
                    data.rotate = MathUtil.getRandomInteger(30, 45);

                data.force = cc.v2(-this.implusion, this.implusionOffset);
                break;
            case Dir.right:
                p = player.y + player.height / 2;
                s = rect.y + rect.height / 2;
                if (p > s)
                    data.rotate = MathUtil.getRandomInteger(30, 45);
                else
                    data.rotate = -MathUtil.getRandomInteger(30, 45);

                data.force = cc.v2(this.implusion, this.implusionOffset);
                break;
            case Dir.up:
                p = player.x + player.width / 2;
                s = rect.x + rect.width / 2;
                if (p > s) {
                    data.rotate = MathUtil.getRandomInteger(45, 80);
                    data.force = cc.v2(this.implusionOffset, this.implusion);

                }
                else {
                    data.rotate = -MathUtil.getRandomInteger(45, 70);
                    data.force = cc.v2(-this.implusionOffset, this.implusion);

                }

                break;
        }

        EventManager.ins.sendEvent(EventType.Dead, data);
    }

    update(dt) {
        if (this.isOpen) {
            this.cT += dt;

            if (this.cT >= this.tOfOpen)
                this.on();
        }
        else if (this.isFire) {
            this.cT += dt;

            if (this.cT >= this.duration)
                this.off();
        }
    }
}
