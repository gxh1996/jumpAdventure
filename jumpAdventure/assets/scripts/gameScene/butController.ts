import EventManager, { EventType } from "../modules/eventManager/eventManager";

const { ccclass, property } = cc._decorator;

/**移动按钮状态 */
enum MOVEBUTSTATE { left, right, show, hidden };

@ccclass
export default class ButController extends cc.Component {

    @property(cc.Node)
    private jumpBut: cc.Node = null;

    @property(cc.Node)
    private moveButArea: cc.Node = null;

    @property(cc.Node)
    private moveBut: cc.Node = null;

    @property(cc.Node)
    private leftBut: cc.Node = null;

    @property(cc.Node)
    private rightBut: cc.Node = null;

    private moveButState: MOVEBUTSTATE = MOVEBUTSTATE.hidden;
    /**中间态的距离 */
    private middleLen: number = 20;

    start() {
        this.jumpBut.on(cc.Node.EventType.TOUCH_START, this.downJumpBut, this);

        this.moveButArea.on(cc.Node.EventType.TOUCH_START, this.startTouchMoveButArea, this);
        this.moveButArea.on(cc.Node.EventType.TOUCH_MOVE, this.moveTouchMoveButArea, this);
        this.moveButArea.on(cc.Node.EventType.TOUCH_END, this.unTouchMoveButArea, this);
        this.moveButArea.on(cc.Node.EventType.TOUCH_CANCEL, this.unTouchMoveButArea, this);

    }

    private startTouchMoveButArea(e: cc.Touch) {
        this.updateMoveButState(MOVEBUTSTATE.show);
        this.moveBut.setPosition(this.moveBut.parent.convertToNodeSpaceAR(e.getLocation()));
    }
    private moveTouchMoveButArea(e: cc.Touch) {
        let startP: cc.Vec2 = e.getStartLocation();
        let curP: cc.Vec2 = e.getLocation();
        // console.log(startP, curP);
        let state: MOVEBUTSTATE;

        if (Math.abs(startP.x - curP.x) < this.middleLen / 2)
            state = MOVEBUTSTATE.show;
        else {
            if (startP.x < curP.x)
                state = MOVEBUTSTATE.right;
            else if (startP.x > curP.x)
                state = MOVEBUTSTATE.left;
        }
        this.updateMoveButState(state);
    }
    private unTouchMoveButArea() {
        this.updateMoveButState(MOVEBUTSTATE.hidden);
    }

    /**设置移动按钮显示 */
    private updateMoveButState(state: MOVEBUTSTATE) {
        if (this.moveButState !== state) {
            switch (this.moveButState) {
                case MOVEBUTSTATE.show:
                    this.moveBut.active = false;
                    break;
                case MOVEBUTSTATE.right:
                    this.rightBut.scale = 1;
                    this.moveBut.active = false;
                    this.upRightBut();
                    break;
                case MOVEBUTSTATE.left:
                    this.leftBut.scale = 1;
                    this.moveBut.active = false;
                    this.upLeftBut();
                    break;
            }

            switch (state) {
                case MOVEBUTSTATE.show:
                    this.moveBut.active = true;
                    break;
                case MOVEBUTSTATE.right:
                    this.rightBut.scale = 1.1;
                    this.moveBut.active = true;
                    this.downRightBut();
                    break;
                case MOVEBUTSTATE.left:
                    this.leftBut.scale = 1.1;
                    this.moveBut.active = true;
                    this.downLeftBut();
                    break;
                case MOVEBUTSTATE.hidden:
                    break;
            }

            this.moveButState = state;
        }
    }


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
