import EventManager, { EventType } from "../../modules/eventManager/eventManager";

const { ccclass, property } = cc._decorator;

/*  微信存储接口  */
@ccclass
export default class WXHelper {

    static ins: WXHelper = null;

    /**
     * 使用前必须执行
     */
    static init() {
        if (this.ins === null)
            this.ins = new WXHelper();
        else
            console.warn("重复初始化！");

        /* 事件订阅 */
        EventManager.ins.onEvent(EventType.LoginSuccess, this.ins.initWX, this.ins);
    }

    /**
     * 开发数据域实例
     */
    private openDataContext = null;

    /**
     * 分享页面的标题
     */
    private shareTitle: string = "这是分享页面的标题"
    /**
     * 分享图片的路径
     */
    private imageUrl: string = "";

    userNick: string = null;
    imgTexture: cc.Texture2D = null;

    /**
     * 初始化微信接口设置
     */
    private initWX() {
        let self = this;

        //得到开发数据域实例
        this.openDataContext = wx.getOpenDataContext();

        //设置分享
        if (self.imageUrl === "") {
            console.log("显示转发按钮！");

            //显示当前页面的转发按钮
            wx.showShareMenu({
                withShareTicket: true
            });
            //监听用户点击右上角菜单的[转发]按钮事件
            wx.onShareAppMessage(() => {
                return {
                    title: self.shareTitle,
                    //转发显示图片的链接,图片长宽比是 5:4
                    //网路图片=>'https://...'
                    imageUrl: cc.url.raw(self.imageUrl),
                }
            });
        }

        //开启监听 返回小程序启动参数（只有第一次激活生效）
        let launchOption = wx.getLaunchOptionsSync();
        console.log('首次开启 launchOption')
        console.log("小程序启动参数:", launchOption);

        //开启监听小游戏回到前台的事件 (分享返回，下拉框返回)
        // wx.onShow(function (dt) {
        //     console.log('回到前台onShow');
        //     console.log(dt);

        //     if (launchOption.scene == 1044) {
        //         //判断是否从群分享链接进入  打开群排行
        //         self.open.getComponent('openDomain').openCrowdRank(launchOption.shareTicket);
        //     }
        //     else if (dt.scene == 1044) {
        //         self.open.getComponent('openDomain').openCrowdRank(dt.shareTicket);
        //     }
        //     else if (launchOption.scene == 1007) {
        //         //判断是否为分享页进入
        //         console.log('分享好友开启' + launchOption.query.openid);
        //     }
        //     else if (dt.scene == 1007) {
        //         console.log('分享好友开启' + dt.query.openid);
        //     }
        // });


        //显示用户信息
        // let userInfo = wx.getStorageSync("userInfo");
        // console.log("从本地取到的用户信息：", userInfo);

        // this.userNick = userInfo.nickName;
        // cc.loader.load({ url: userInfo.avatarUrl, type: 'png' }, (e, r) => {
        //     self.imgTexture = r;
        //     EventManager.ins.sendEvent(EventType.ShowUserInfo);
        // })

        //初始化排行榜面板
        EventManager.ins.sendEvent(EventType.InitRankList);
    }

    /**
     * 上传成绩
     * @param score 
     */
    uploadScore(score: any) {
        console.log("上传分数：", score);
        this.postMassage("score", score);
    }

    /**刷新排行榜 */
    refreshRankList() {
        // console.log(this);
        // console.log(this.postMassage);
        this.postMassage("friend", null);
    }

    /**
     * 向开发数据域发送消息
     * @param type 消息类型
     */
    private postMassage(type: string, value: any) {
        // console.log("openDataContext:", this);
        this.openDataContext.postMessage({
            type: type,
            value: value
        })
    }

}
