const { ccclass, property, disallowMultiple, menu, requireComponent } = cc._decorator;

@ccclass
@disallowMultiple
@requireComponent(cc.Button)
@menu("自定义组件/ButControl")
export default class ButControl extends cc.Component {

    @property(cc.Component.EventHandler)
    private downEvent: cc.Component.EventHandler = new cc.Component.EventHandler();

    @property(cc.Component.EventHandler)
    private upEvent: cc.Component.EventHandler = new cc.Component.EventHandler();

    private button: cc.Button;

    onLoad() {
        this.button = this.node.getComponent(cc.Button);

        this.node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchEnd, this);
    }

    private touchStart() {
        this.downEvent.emit(null);
    }

    private touchEnd() {
        this.upEvent.emit(null);
    }
}
