import EventManager, { EventType } from "../modules/eventManager/eventManager";

const { ccclass, property, disallowMultiple, menu } = cc._decorator;

@ccclass
@disallowMultiple
@menu("自定义组件/KeyControl")
export default class KeyControl extends cc.Component {

    private isCtrl: boolean = true;

    start() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        EventManager.ins.onEvent(EventType.CloseCtrlPlayer, () => {
            this.isCtrl = false;
        }, this)
        EventManager.ins.onEvent(EventType.OpenCtrlPlayer, () => {
            this.isCtrl = true;
        }, this)
    }

    onKeyDown(e) {
        if (!this.isCtrl)
            return;

        switch (e.keyCode) {
            case cc.macro.KEY.left:
                EventManager.ins.sendEvent(EventType.MoveButDown, -1);
                // console.log("按下左方向键");
                break;
            case cc.macro.KEY.right:
                EventManager.ins.sendEvent(EventType.MoveButDown, 1);
                // console.log("按下右方向键");
                break;
            case cc.macro.KEY.space:
                EventManager.ins.sendEvent(EventType.JumpButDown);
                // console.log("按下空格键");
                break;
        }
    }

    onKeyUp(e) {
        if (!this.isCtrl)
            return;

        switch (e.keyCode) {
            case cc.macro.KEY.left:
                EventManager.ins.sendEvent(EventType.MoveButUp, -1);
                // console.log("弹起左方向键");
                break;
            case cc.macro.KEY.right:
                EventManager.ins.sendEvent(EventType.MoveButUp, 1);
                // console.log("弹起右方向键");
                break;
        }
    }

    onDestroy() {
        EventManager.ins.deleteSubscriber(this);
    }
}
