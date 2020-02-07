const { ccclass, property, disallowMultiple, menu } = cc._decorator;

@ccclass
@disallowMultiple()
@menu('自定义组件/SwitchBut')
export default class SwitchBut extends cc.Component {

    @property(cc.SpriteFrame)
    private state1: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    private state2: cc.SpriteFrame = null;

    @property(cc.Component.EventHandler)
    private clickEvent1: cc.Component.EventHandler = new cc.Component.EventHandler();

    @property(cc.Component.EventHandler)
    private clickEvent2: cc.Component.EventHandler = new cc.Component.EventHandler();

    private sprite: cc.Sprite = null;

    onLoad() {
        this.sprite = this.node.getComponent(cc.Sprite);

        this.node.on(cc.Node.EventType.TOUCH_START, this.click, this);
    }

    private click() {
        if (this.sprite.spriteFrame === this.state1) {
            //进入state2
            this.sprite.spriteFrame = this.state2;
            this.clickEvent2.emit(null);
        }
        else {
            this.sprite.spriteFrame = this.state1;
            this.clickEvent1.emit(null);
        }
    }

    /**设置按钮显示 */
    setState(n: number) {
        if (n === 1) {
            this.sprite.spriteFrame = this.state1;
        }
        else {
            this.sprite.spriteFrame = this.state2;
        }
    }
}
