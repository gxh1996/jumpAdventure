import MathUtil from "../common/mathUtil";
import { DIR } from "../common/commonVar";
import EventManager, { EventType } from "../modules/eventManager/eventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EndPoint extends cc.Component {

    private isEnd: boolean = false;
    // onLoad () {}

    start() {

    }

    onBeginContact(c, s, o: cc.PhysicsBoxCollider) {
        if (this.isEnd)
            return;

        if (o.node.group === "PLAYER" && MathUtil.isSide(o, s, DIR.up)) {
            this.isEnd = true;
            EventManager.ins.sendEvent(EventType.Win);
        }
    }

    // update (dt) {}
}
