import EventManager, { EventType } from "../modules/eventManager/eventManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ButController extends cc.Component {

    private downJumpBut() {
        EventManager.ins.sendEvent(EventType.JumpButDown);
    }

    private downLeftBut() {
        EventManager.ins.sendEvent(EventType.MoveButDown, -1);
    }

    private upLeftBut() {
        EventManager.ins.sendEvent(EventType.MoveButUp, -1);
    }

    private downRightBut() {
        EventManager.ins.sendEvent(EventType.MoveButDown, 1);
    }

    private upRightBut() {
        EventManager.ins.sendEvent(EventType.MoveButUp, 1);
    }
}
