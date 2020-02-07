import MathUtil from "../common/mathUtil";

const { ccclass, property } = cc._decorator;

@ccclass
export default class OneWayPlatform extends cc.Component {


    onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsBoxCollider, other: cc.PhysicsBoxCollider) {
        if (other.node.group !== "PLAYER")
            return;

        if (MathUtil.relativeLocationVertical(self, other) === 1)
            contact.disabled = true;
    }

}
