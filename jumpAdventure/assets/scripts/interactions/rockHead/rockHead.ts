import RockHeadBg from "./rockHeadBg";
import DebugUtil, { DebugKey } from "../../modules/debugUtil";
import { DIR, Dir, HitData } from "../../common/commonVar";
import MathUtil from "../../common/mathUtil";
import EventManager, { EventType } from "../../modules/eventManager/eventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RockHead extends cc.Component {

    @property()
    private speed: number = 1;

    @property({ displayName: "停靠时间" })
    private dockingT: number = 3;

    @property(RockHeadBg)
    private anim: RockHeadBg = null;

    @property({
        type: Dir,
        tooltip: "首次移动方向"
    })
    private firstMoveDir: number = Dir.right;

    @property({ displayName: "有齿" })
    private haveSpike: boolean = false;

    @property()
    private haveAnim: boolean = true;

    private bugUtil: DebugUtil = DebugUtil.ins;
    private ct: number = 0;
    /**
     * 是否停靠
     */
    private isDocking: boolean = false;
    /**
     * 角色在上面
     */
    private playerUnder: boolean = false;

    private rigid: cc.RigidBody = null;
    private collider: cc.PhysicsBoxCollider = null;
    private player: cc.PhysicsBoxCollider = null;
    private postP: cc.Vec2 = null;
    /**通知过角色其在垂直移动的物体上 */
    private notifiedPVerMove: boolean = false;

    onLoad() {
        this.rigid = this.node.getComponent(cc.RigidBody);
        this.collider = this.node.getComponent(cc.PhysicsBoxCollider);

        this.node.on("arriveP", this.arriveP, this);
        this.node.on("pressCheck", this.pressCheck, this);

        EventManager.ins.onEventOnce(EventType.InitGameScene, this.init, this);
        // EventManager.ins.onEvent(EventType.PauseGame, this.pauseGame, this)
        // EventManager.ins.onEvent(EventType.ContinueGame, this.continueGame, this);
    }

    private init() {
        if (this.haveAnim) {
            this.postP = this.node.getPosition();
            this.anim.init(this.speed);
            this.anim.setupAnim(this.firstMoveDir);
        }
    }

    private arriveP() {
        this.isDocking = true;
        this.ct = 0;
    }

    private pressCheck() {
        if (this.player === null)
            return;

        switch (this.anim.curDir) {
            case DIR.down:
                if (MathUtil.isSide(this.player, this.collider, DIR.down))
                    EventManager.ins.sendEvent(EventType.Dead);
                break;
            case DIR.up:
                if (MathUtil.isSide(this.player, this.collider, DIR.up))
                    EventManager.ins.sendEvent(EventType.Dead);
                break;
            case DIR.left:
                if (MathUtil.isSide(this.player, this.collider, DIR.left))
                    EventManager.ins.sendEvent(EventType.Dead, this.getRandomHitData(this.anim.curDir));
                break;
            case DIR.right:
                if (MathUtil.isSide(this.player, this.collider, DIR.right))
                    EventManager.ins.sendEvent(EventType.Dead, this.getRandomHitData(this.anim.curDir));
                break;
        }
    }
    /**
     * 得到随机的碰撞信息
     * @param d 
     */
    private getRandomHitData(d: DIR): HitData {
        let h: HitData = new HitData;
        if (d === DIR.left) {
            h.force = cc.v2(-MathUtil.getRandomInteger(20, 40), 0);
            h.rotate = MathUtil.getRandomInteger(30, 90);
        }
        else if (DIR.right) {
            h.force = cc.v2(MathUtil.getRandomInteger(20, 40), 0);
            h.rotate = -MathUtil.getRandomInteger(30, 90);
        }
        else
            h = null;
        return h;
    }

    /**有刺的移动头碰撞角色的撞击信息 */
    private getHitDataWithSpike(s, o): HitData {
        let h: HitData = new HitData();
        let dir: DIR = MathUtil.getRelativeDir(s, o);
        if (dir === DIR.up) {
            h.force = cc.v2(0, MathUtil.getRandomInteger(20, 40));
            h.rotate = MathUtil.getRandomInteger(30, 90);
        }
        else if (dir === DIR.down) {
            h.force = cc.v2(0, -MathUtil.getRandomInteger(5, 20));
            h.rotate = MathUtil.getRandomInteger(-10, -20);
        }
        else if (dir === DIR.left) {
            h.force = cc.v2(-MathUtil.getRandomInteger(20, 40), 0);
            h.rotate = MathUtil.getRandomInteger(30, 90);
        }
        else if (dir === DIR.right) {
            h.force = cc.v2(MathUtil.getRandomInteger(20, 40), 0);
            h.rotate = -MathUtil.getRandomInteger(30, 90);
        }
        return h;
    }

    onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsBoxCollider, other: cc.PhysicsBoxCollider) {
        if (other.node.group === "PLAYER") {
            if (this.haveSpike) {
                contact.disabled = true;
                EventManager.ins.sendEvent(EventType.Dead, this.getHitDataWithSpike(self, other));
            }
            else {
                this.bugUtil.log(DebugKey.RockHead, "碰撞角色");
                this.player = other;

                let dir: number = MathUtil.relativeLocationVertical(other, self);

                if (dir === 1) {
                    this.bugUtil.log(DebugKey.RockHead, "角色在其上面");
                    this.playerUnder = true;

                    if (this.isVerMoving()) {
                        this.bugUtil.log(DebugKey.RockHead, "处于垂直移动状态，告诉角色在垂直移动实体上");

                        EventManager.ins.sendEvent(EventType.InVerMovedEntity);
                        this.notifiedPVerMove = true;
                    }
                }
            }
        }
    }

    onEndContact(c: cc.PhysicsContact, self: cc.PhysicsBoxCollider, other: cc.PhysicsBoxCollider) {
        this.bugUtil.log(DebugKey.RockHead, "结束碰撞");
        this.player = null;

        if (this.playerUnder) {
            this.bugUtil.log(DebugKey.RockHead, "角色从移动头上离开");
            this.playerUnder = false;

            if (this.notifiedPVerMove) {
                EventManager.ins.sendEvent(EventType.ExitVerMovedEntiry);
                this.notifiedPVerMove = false;
            }
        }


    }

    /**是否正在水平移动 */
    private isHoriMoving(): boolean {
        if (this.anim.curDir === DIR.left || this.anim.curDir === DIR.right)
            return true;
        return false;
    }

    /**是否正在垂直移动 */
    private isVerMoving(): boolean {
        if (this.anim.curDir === DIR.up || this.anim.curDir === DIR.down)
            return true;
        return false;
    }

    update(dt) {
        if (this.anim.curDir === null) {
            this.ct += dt;
            if (this.ct >= this.dockingT) {
                this.bugUtil.log(DebugKey.RockHead, "停靠结束，继续移动");

                this.anim.continuePlay();
            }
        }
        else {
            let cp: cc.Vec2 = this.node.getPosition();

            if (this.playerUnder && this.isHoriMoving()) {
                let p: cc.Vec2 = this.player.node.getPosition();
                this.player.node.setPosition(p.add(cp.sub(this.postP)));
            }
            this.postP = cp;
        }

    }

}
