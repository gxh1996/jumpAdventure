import { HitData } from "../common/commonVar";
import MathUtil from "../common/mathUtil";
import EventManager, { EventType } from "../modules/eventManager/eventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Spike extends cc.Component {

    /**
     * 攻击给与角色的冲力
     */
    private implusion: number = 50;
    /**
     * 附带的偏差力
     */
    private implusionOffset: number = 10;
    /**
     * 给与角色死亡时的最小角度
     */
    private minR: number = 30;
    private maxR: number = 90

    onBeginContact(c, s: cc.PhysicsBoxCollider, o: cc.PhysicsBoxCollider) {
        if (o.node.group === "PLAYER" && s.tag === 0) {
            let player: any = s.getAABB();
            let other: any = o.getAABB();

            let data: HitData = new HitData();
            if (Math.abs(player.x + player.width - other.x) < 10) {
                data.force = cc.v2(-this.implusionOffset, this.implusion);
                data.rotate = -MathUtil.getRandomInteger(this.minR, this.maxR);
            }
            else if (Math.abs(player.x - other.x - other.width) < 10) {
                data.force = cc.v2(this.implusionOffset, this.implusion);
                data.rotate = MathUtil.getRandomInteger(this.minR, this.maxR);
            }
            else {
                data.force = cc.v2(0, this.implusion);
                data.rotate = MathUtil.getRandomInteger(-45, 45);
            }

            EventManager.ins.sendEvent(EventType.Dead, data);
        }
    }

}
