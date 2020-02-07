import EventManager, { EventType } from "../../modules/eventManager/eventManager";
import WXHelper from "./wxHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WXShowUserInfo extends cc.Component {

    @property({ type: cc.Sprite })
    private image: cc.Sprite = null;

    @property({ type: cc.Label })
    private username: cc.Label = null;

    onLoad() {
        EventManager.ins.onEvent(EventType.ShowUserInfo, this.show, this);
    }

    start() {
        //自动修改位置适应微信小游戏界面
        if (typeof wx !== "undefined") {
            let widget: cc.Widget = this.node.getComponent(cc.Widget);

            let menu = wx.getMenuButtonBoundingClientRect();
            widget.top = menu.top * cc.view.getScaleY();
        }
        cc.game.addPersistRootNode(this.node);
    }

    /**
     * 获得用户信息并存在本地后调用，显示用户信息
     */
    show() {
        console.log("开始显示用户信息");


        //设置昵称的显示
        this.username.string = WXHelper.ins.userNick;

        //设置头像的显示
        this.image.spriteFrame = new cc.SpriteFrame(WXHelper.ins.imgTexture);
    }
}
