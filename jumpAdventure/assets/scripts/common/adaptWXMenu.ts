const { ccclass, disallowMultiple, menu, requireComponent } = cc._decorator;

@ccclass
@disallowMultiple
@requireComponent(cc.Widget)
@menu("自定义组件/AdaptWXMenu")
export default class AdaptWXMenu extends cc.Component {

    onLoad() {
        if (typeof wx !== "undefined") {
            // console.log("AdatWXMenu适配前按钮坐标：", this.node.getPosition());
            this.cancelAdaptTop();
            let visible: cc.Size = cc.view.getVisibleSize();
            let menu = wx.getMenuButtonBoundingClientRect();
            // console.log("微信菜单坐标", menu);
            let y: number = visible.height - menu.bottom;
            this.node.y = this.node.parent.convertToNodeSpace(cc.v2(0, y)).y;
            // console.log("AdatWXMenu适配后按钮坐标：", this.node.getPosition());
        }
    }

    /**取消cc.Widget组件上top方向的适配 */
    private cancelAdaptTop() {
        let w: cc.Widget = this.node.getComponent(cc.Widget);
        w.isAlignTop = false;
        w.updateAlignment();
    }

}
