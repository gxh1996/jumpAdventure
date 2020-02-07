import FrameAnimation from "../../common/frameAnim";
import DebugUtil, { DebugKey } from "../../modules/debugUtil";
import MathUtil from "../../common/mathUtil";
import { ContactInfo, OnEndContact } from "../../common/commonVar";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MovedPlatformBg extends cc.Component {

    @property(FrameAnimation)
    anim: FrameAnimation = null;

    rigid: cc.RigidBody = null;

    /**
     * 玩家在平台上
     */
    isPlayerUnder: boolean = false;

    /**
     * 角色接触平台底部
     */
    isContactBottom: boolean = false;
    private record: cc.Vec2 = null;

    /**
     * 是否为水平移动
     */
    // isHorizMove: boolean = null;

    private self: cc.PhysicsBoxCollider = null;
    private player: cc.PhysicsBoxCollider = null;

    onLoad() {
        this.rigid = this.node.getComponent(cc.RigidBody);
        this.self = this.node.getComponent(cc.PhysicsBoxCollider);
    }

    onBeginContact(contact: cc.PhysicsContact, self, other: cc.PhysicsBoxCollider) {
        if (other.node.group === "PLAYER" && !this.isPlayerUnder) {
            // let d: number = MathUtil.relativeLocationVertical(other, self);
            if (MathUtil.inColumn(<any>other.getAABB(), self.getAABB())) {
                let t: any = other.getAABB();
                let o: cc.Vec2 = (<cc.Rect>t).center;
                t = self.getAABB();
                let s: cc.Vec2 = (<cc.Rect>t).center;

                if (o.y > s.y) {
                    DebugUtil.ins.log(DebugKey.MovedPlatformBg, "角色到平台上");
                    if (!this.player)
                        this.player = other;

                    this.isPlayerUnder = true;

                    let e: cc.Event.EventCustom = new cc.Event.EventCustom("playerUnderPlatform", true);
                    e.detail = new ContactInfo(contact, self, other);
                    this.node.dispatchEvent(e);
                }
                else if (this.rigid.linearVelocity.y < 0 && Math.abs(this.getVelocityOfCollider(other).y) < 3) {
                    DebugUtil.ins.log(DebugKey.MovedPlatformBg, "无水平速度的角色在向下移动的平台下方并相遇，停止平台移动");

                    this.isContactBottom = true;
                    this.record = this.rigid.linearVelocity;
                    this.rigid.linearVelocity = cc.v2();
                }
            }

            // if (d === 1) {
            //     DebugUtil.ins.log(DebugKey.MovedPlatformBg, "角色到平台上");
            //     if (!this.player)
            //         this.player = other;

            //     this.isPlayerUnder = true;

            //     let e: cc.Event.EventCustom = new cc.Event.EventCustom("playerUnderPlatform", true);
            //     e.detail = new ContactInfo(contact, self, other);
            //     this.node.dispatchEvent(e);
            // }
            // else if (d === -1 && this.rigid.linearVelocity.y < 0 && Math.abs(this.getVelocityOfCollider(other).y) < 3) {
            //     DebugUtil.ins.log(DebugKey.MovedPlatformBg, "无水平速度的角色在向下移动的平台下方并相遇，停止平台移动");

            //     this.isContactBottom = true;
            //     this.record = this.rigid.linearVelocity;
            //     this.rigid.linearVelocity = cc.v2();
            // }
        }
    }

    _onEndContact(contact, self: cc.PhysicsBoxCollider, other: cc.PhysicsBoxCollider) {
        DebugUtil.ins.log(DebugKey.MovedPlatformBg, "角色离开平台之上");

        this.isPlayerUnder = false;
        let e: cc.Event.EventCustom = new cc.Event.EventCustom("exitUnderPlatform", true);
        e.detail = new ContactInfo(contact, self, other);
        this.node.dispatchEvent(e);

    }

    private getVelocityOfCollider(c: cc.PhysicsBoxCollider): cc.Vec2 {
        let rigid: cc.RigidBody = c.node.getComponent(cc.RigidBody);
        return rigid.linearVelocity;
    }

    update() {
        //官方结束碰撞检测不适用，自己写一个
        if (this.isPlayerUnder) {
            if (OnEndContact(this.self, this.player))
                this._onEndContact(null, this.self, this.player);
        }
        else if (this.isContactBottom) {
            let self: any = this.self.getAABB();
            let player: any = this.player.getAABB();

            //水平判断
            if (player.x + player.width <= self.x || player.x >= self.x + self.width) {
                DebugUtil.ins.log(DebugKey.MovedPlatformBg, "角色离开平台下方，继续移动平台");

                this.rigid.linearVelocity = this.record;
                this.isContactBottom = false;
            }

        }
    }

}
