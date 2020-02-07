import MathUtil from "../common/mathUtil";
import { GiveExtraSpeed } from "../common/commonVar";
import DebugUtil, { DebugKey } from "../modules/debugUtil";

const { ccclass, property } = cc._decorator;

@ccclass("PropertyOfPlayer")
export default class PropertyOfPlayer {

    @property({ tooltip: "地面水平速度" })
    readonly speed: number = 120;

    @property({ tooltip: "空中水平速度" })
    readonly speedInAir: number = 60;

    @property({ tooltip: "跳跃力" })
    readonly jumpForce: number = 50;

    @property({ tooltip: "抓墙时的下落速度" })
    readonly climbWallSpeed: number = 20;

    /**
     * 跳跃次数
     */
    private jumpCount: number;
    /**
     * 移动按钮状态
     */
    isClickMoveBut: number;
    /**
     * 额外速度
     */
    private extraSpeed: Map<string, cc.Vec2>;
    private colliderArray: cc.PhysicsBoxCollider[];


    /**
     * 初始化属性 
     */
    init() {
        this.jumpCount = 0;
        this.isClickMoveBut = 0;
        this.extraSpeed = new Map<string, cc.Vec2>();
        this.colliderArray = [];
    }

    addJumpCount() {
        this.jumpCount++;

        DebugUtil.ins.log(DebugKey.Property, `增加跳跃次数到${this.jumpCount}`);
    }

    getJumpCount(): number {
        DebugUtil.ins.log(DebugKey.Property, `得到跳跃次数为${this.jumpCount}`);

        return this.jumpCount;
    }

    resetJumpCount() {
        DebugUtil.ins.log(DebugKey.Property, "reset jumpCount");

        this.jumpCount = 0;
    }

    /**
     * 得到总额外速度
     */
    getExtraSpeed(): cc.Vec2 {
        let vs = this.extraSpeed.values();
        let v: cc.Vec2;
        let sum: cc.Vec2 = cc.v2(0, 0);
        while (v = vs.next().value)
            sum.addSelf(v);

        return sum;
    }

    /**
     * 记录额外速度
     * @param who 
     * @param v 
     */
    recordExtraSpeed(gev: GiveExtraSpeed) {
        this.extraSpeed.set(gev.who, gev.v);
    }

    removeExtraSpeed(who: string) {
        if (!this.extraSpeed.has(who)) {
            console.error(`${who}没有给角色速度,请处理!`);
            return;
        }

        this.extraSpeed.set(who, cc.v2(0, 0));
    }

    /**
     * 记录该碰撞体
     */
    recordCollider(c: cc.PhysicsBoxCollider) {
        this.colliderArray.push(c);
    }

    /**
     * 移除该碰撞体记录
     */
    removeRecordOfCollider(c: cc.PhysicsBoxCollider) {
        MathUtil.removeItemFromArray(c, this.colliderArray);
    }

    /**
     * 得到当前正在碰撞的碰撞体
     */
    getAllCollider(): cc.PhysicsBoxCollider[] {
        return this.colliderArray;
    }

}