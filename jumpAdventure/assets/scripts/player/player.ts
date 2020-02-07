import PlayerAnim from "./playerAnim";
import PlayerState from "./playerState/playerState";
import MathUtil from "../common/mathUtil";
import { DeadState } from "./playerState/deadState";
import { DoubleJumpState } from "./playerState/doubleJumpState";
import { FallState } from "./playerState/fallState";
import { IdleState } from "./playerState/idleState";
import { JumpState } from "./playerState/jumpState";
import { RunState } from "./playerState/runState";
import { UpState } from "./playerState/upState";
import { ClimbWallState } from "./playerState/climbWallState";
import PropertyOfPlayer from "./property";
import { HitData, GiveExtraSpeed } from "../common/commonVar";
import EventManager, { EventType } from "../modules/eventManager/eventManager";
import DebugUtil, { DebugKey } from "../modules/debugUtil";
import SoundsManager from "../modules/soundManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {
    /* 角色状态实例 */
    static climbWallState: ClimbWallState = new ClimbWallState();
    static deadState: DeadState = new DeadState();
    static doubleJumpState: DoubleJumpState = new DoubleJumpState();
    static fallState: FallState = new FallState();
    static idleState: IdleState = new IdleState();
    static jumpState: JumpState = new JumpState();
    static runState: RunState = new RunState();
    static upState: UpState = new UpState();

    @property(PlayerAnim)
    anim: PlayerAnim = null;

    @property(PropertyOfPlayer)
    property: PropertyOfPlayer = new PropertyOfPlayer();

    rigid: cc.RigidBody = null;
    collider: cc.PhysicsBoxCollider = null;

    private state: PlayerState;
    /**
     * 自身产生的速度，如主动移动
     */
    private selfSpeed: number = 0;

    /* 控制 */
    /**
     * 是否更新线速度
     */
    updateSpeed: boolean = true;
    private isUpdate: boolean = true;
    /**
     * 站在垂直移动的实体上;不再进行垂直速度的检查
     */
    private inVerMovedEntity: boolean = false;

    onLoad() {
        this.rigid = this.node.getComponent(cc.RigidBody);
        this.collider = this.node.getComponent(cc.PhysicsBoxCollider);

        this.onEvent();
    }

    private onEvent() {
        let self = this;
        /* 事件监听 */
        EventManager.ins.onEventOnce(EventType.InitPlayer, this.initPlayer, this);
        EventManager.ins.onEvent(EventType.MoveButDown, this.moveBut, this);
        EventManager.ins.onEvent(EventType.MoveButUp, this.releaseMoveBut, this);
        EventManager.ins.onEvent(EventType.JumpButDown, this.jumpBut, this);

        EventManager.ins.onEvent(EventType.ChangeSpeedYPlayer, this.setSpeedY, this);
        EventManager.ins.onEvent(EventType.ApplyImpulsionToPlayer, this.applyImpulsion, this);
        EventManager.ins.onEvent(EventType.GivePlayerConstantSpeed, this.setConstantSpeed, this);
        EventManager.ins.onEvent(EventType.RemovePlayerConstantSpeed, this.removeConstantSpeed, this);

        EventManager.ins.onEvent(EventType.Dead, this.dead, this);
        EventManager.ins.onEvent(EventType.Win, this.win, this);

        EventManager.ins.onEvent(EventType.InVerMovedEntity, () => { self.inVerMovedEntity = true; }, this);
        EventManager.ins.onEvent(EventType.ExitVerMovedEntiry, () => { self.inVerMovedEntity = false; }, this);

        EventManager.ins.onEvent(EventType.CanRotate, () => { self.rigid.fixedRotation = false; }, this);

    }

    private init() {
        this.property.init();
        this.selfSpeed = 0;
        this.updateSpeed = true;
        this.isUpdate = true;
        this.inVerMovedEntity = false;

        this.rigid.enabledContactListener = true;
        // this.collider.enabled = true;
        // this.collider.apply();

        //初始化角色状态
        this.state = Player.fallState;
        this.state.setPlayer(this);
        this.state.enter();
    }

    /**
     * 设置状态，先离开该状态，再进入新状态
     * @param s 
     */
    setState(s: PlayerState) {
        this.state.exit();

        this.state = s;
        this.state.setPlayer(this);
        this.state.enter();
    }

    getState(): PlayerState {
        return this.state;
    }

    /**
     * 设置当前自身产生的水平速度
     */
    setSelfSpeed(s: number) {
        // console.log("设置速度为", s);
        this.selfSpeed = s;
    }

    /*         事件监听的回调函数                 */

    private initPlayer() {
        this.anim.init();
        this.init();

        //出场动画
        this.anim.appearing((() => {
            this.anim.fall();
            this.rigid.gravityScale = 1;
        }).bind(this));
    }

    /**
     * 设置持续力
     * @param gev 
     */
    private setConstantSpeed(gev: GiveExtraSpeed) {
        this.property.recordExtraSpeed(gev);
    }

    /**
     * 移除who给予的持续速度
     * @param who 
     */
    private removeConstantSpeed(who: string) {
        this.property.removeExtraSpeed(who);
    }

    private win() {
        let self = this;
        EventManager.ins.sendEvent(EventType.CloseCtrlPlayer);
        this.rigid.linearVelocity = cc.v2();
        this.state = Player.deadState;
        this.anim.jump();
        this.applyImpulsion(cc.v2(0, 55));
        this.rigid.enabledContactListener = false;
        this.isUpdate = false;
        this.scheduleOnce(() => {
            self.rigid.linearVelocity.y = 0;
            self.rigid.gravityScale = 0;
            self.anim.desappearing(() => {
                self.node.active = false;
                EventManager.ins.sendEvent(EventType.MakeScore);
            })
        }, 0.6)
    }

    /*          用户或环境输入相关的函数            */

    private moveBut(dir: number) {
        DebugUtil.ins.log(DebugKey.ClickButton, "点击移动按钮", dir);

        if (this.property.isClickMoveBut === 0) {
            this.property.isClickMoveBut = dir;
            DebugUtil.ins.log(DebugKey.ClickButton, "记录移动按钮：" + dir);

            this.state.moveBut(dir);
        }
        else if (this.property.isClickMoveBut !== dir) {
            this.releaseMoveBut(this.property.isClickMoveBut);
            this.property.isClickMoveBut = dir;
            this.state.moveBut(dir);
        }
    }

    private releaseMoveBut(dir: number) {
        DebugUtil.ins.log(DebugKey.ClickButton, "释放移动按钮", dir);

        if (this.property.isClickMoveBut === dir) {
            this.property.isClickMoveBut = 0;
            DebugUtil.ins.log(DebugKey.ClickButton, "记录移动按钮状态：" + 0);

            this.state.releaseMoveBut();
        }
    }

    private jumpBut() {
        if (this.property.getJumpCount() === 2)
            return;

        this.state.jumpBut();
    }

    private downSpeed() {
        this.state.downSpeed();
    }

    private upSpeed() {
        this.state.upSpeed();
    }

    /**
     * 受到冲力
     */
    private impulsion(f: cc.Vec2) {
        this.applyImpulsion(f);
        this.state.impulsion();
    }

    /**
     * 开始碰撞
     */
    beginContact() {
        this.state.beginContact();
    }

    /**
     * 结束碰撞
     */
    endContact() {
        this.state.endContact();
    }

    private dead(data: HitData) {
        if (!this.isUpdate)
            return;

        DebugUtil.ins.log(DebugKey.GameLogic, `palyer are dead:`, data);
        this.state.dead();
        SoundsManager.ins.playEffect("sounds/game_over");

        this.updateSpeed = false;
        this.rigid.linearVelocity = cc.v2();

        this.anim.dead(data);
        this.isUpdate = false;
        this.rigid.enabledContactListener = false;
        this.collider.enabled = false;
        EventManager.ins.sendEvent(EventType.CloseCtrlPlayer);
        EventManager.ins.sendEvent(EventType.StopCameraFollow);
        EventManager.ins.sendEvent(EventType.CheckPlayerOutFace);

    }


    /*                 碰撞相关                      */

    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsBoxCollider, otherCollider: cc.PhysicsBoxCollider) {
        let g: string = otherCollider.node.group;
        if (g === "FRUIT" || g === "INTERACTION") {
            contact.disabled = true;
            return;
        }

        this.property.recordCollider(otherCollider);
        this.beginContact();
    }

    onEndContact(contact, selfCollider: cc.PhysicsBoxCollider, otherCollider: cc.PhysicsBoxCollider) {
        let g: string = otherCollider.node.group;
        if (g === "FRUIT" || g === "INTERACTION") {
            return;
        }

        this.property.removeRecordOfCollider(otherCollider);
        this.endContact();
    }

    /*                 刚体相关的函数                      */

    /**
     * 判断是否能抓墙
     */
    climbWallEnable(): boolean {
        if (this.property.isClickMoveBut === 0)
            //只有在按方向键的情况下才可能抓墙
            return;

        let r: boolean = false;

        //角色碰撞器世界坐标
        let sp: cc.Vec2 = MathUtil.getWorldCoordinate(this.node).add(this.collider.offset);
        let minY: number = sp.y - this.collider.size.height / 2;
        let maxY: number = minY + this.collider.size.height;
        let t1: number, t2: number;

        //其他碰撞器世界坐标
        let cp: cc.Vec2;
        let cs: cc.PhysicsBoxCollider[] = this.property.getAllCollider();
        let c: cc.PhysicsBoxCollider;

        for (c of cs) {
            //以下事物不能抓
            if (c.node.group === "ONEWAYPLATFORM")
                break;
            if (c.node.group === "FIRE" && c.tag === 1)
                break;

            cp = MathUtil.getWorldCoordinate(c.node).add(c.offset);

            //先判断是否与角色在一水平线上;不在就跳过
            if (minY >= cp.y + c.size.height / 2 || maxY <= cp.y - c.size.height / 2)
                continue;

            if (this.property.isClickMoveBut === 1) {
                //判断碰撞器是否在角色的右边,在就可以抓墙
                t1 = sp.x + this.collider.size.width / 2;
                t2 = cp.x - c.size.width / 2;
                if (Math.abs(t1 - t2) < 2) {
                    r = true;
                    break;
                }
            }
            else if (this.property.isClickMoveBut === -1) {
                t1 = sp.x - this.collider.size.width / 2;
                t2 = cp.x + c.size.width / 2;
                if (Math.abs(t1 - t2) < 2) {
                    r = true;
                    break;
                }
            }
            else
                console.error("错误！");
        }

        return r;
    }

    /**
     * 施加一个冲力
     */
    applyImpulsion(f: cc.Vec2) {
        this.rigid.applyLinearImpulse(f, this.rigid.getWorldCenter(), true);
    }

    /**
     * 立即改变垂直方向的速度
     */
    setSpeedY(s: number) {
        this.rigid.linearVelocity = cc.v2(this.rigid.linearVelocity.x, s);
    }

    /**
     * 更新线速度
     */
    private updateLinearVelocity() {
        if (!this.updateSpeed)
            return;

        //更新角色方向
        if (this.property.isClickMoveBut !== 0)
            this.anim.node.scaleX = this.property.isClickMoveBut;

        let v: cc.Vec2 = this.property.getExtraSpeed();
        let x: number;
        //计算水平方向速度
        // if (this.inMovedPlatform)
        //     x = this.selfSpeed + v.x
        // else
        x = this.selfSpeed + v.x;

        //计算垂直方向速度
        let y: number = this.rigid.linearVelocity.y;
        if (v.y) {
            //如果外界给了角色y方向的速度，就不要重力产生的速度
            y = v.y;
        }

        this.rigid.linearVelocity = cc.v2(x, y);
        // console.log("线速度:", this.rigid.linearVelocity);
    }

    /*                状态检查                               */

    /**
     * 检查y轴线速度
     */
    private checkYSpeed() {
        if (this.inVerMovedEntity)
            return;

        if (this.rigid.linearVelocity.y > 1)
            this.upSpeed();
        else if (this.rigid.linearVelocity.y < -1)
            this.downSpeed();
    }

    /**
    * 是否在地面
    */
    isLand(): boolean {
        let ret = false;

        let cs: cc.PhysicsBoxCollider[] = this.property.getAllCollider();
        let c: cc.PhysicsBoxCollider;
        for (c of cs) {
            if (MathUtil.relativeLocationVertical(this.collider, c, 6) === 1) {
                ret = true;
                break;
            }
        }

        return ret;
    }


    update(dt) {
        if (!this.isUpdate)
            return;

        this.checkYSpeed();
        this.updateLinearVelocity();
    }

    onDestroy() {
        EventManager.ins.deleteSubscriber(this);
    }
}
