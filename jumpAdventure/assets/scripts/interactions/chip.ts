
const { ccclass, property } = cc._decorator;

@ccclass
export default class Chip extends cc.Component {

    @property(cc.RigidBody)
    rigid: cc.RigidBody = null;

    onBeginContact(contact: cc.PhysicsContact, self: cc.PhysicsBoxCollider, other: cc.PhysicsBoxCollider) {
        let b: cc.ActionInterval = cc.blink(2, 5);
        let f: cc.ActionInstant = cc.callFunc(() => {
            this.node.active = false;
        }, this);
        this.node.runAction(cc.sequence(b, f));
        this.rigid.enabledContactListener = false;
    }


}
