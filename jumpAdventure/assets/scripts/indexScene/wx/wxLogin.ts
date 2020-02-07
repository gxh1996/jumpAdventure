import EventManager, { EventType } from "../../modules/eventManager/eventManager";
import DataStorage from "../../modules/dataStorage";
import Global from "../../modules/global";
import WXCloud from "./wxCloud";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WXLogin {

    static ins: WXLogin = null;

    /**
     * 使用前必须执行
     */
    static init() {
        if (this.ins === null)
            this.ins = new WXLogin();
        else
            console.warn("重复初始化！");
    }

    /**
     * 检查小游戏版本的更新,版本没问题就会自动进行登录操作
     */
    updateVersion() {
        if (typeof wx === "undefined")
            return;

        console.log("开始检查小游戏版本...");

        //运行环境
        let self = this;

        //该接口是否可用
        if (typeof wx.getUpdateManager === "function") {
            //得到更新管理器对象
            const updateManager = wx.getUpdateManager();
            //检查小游戏是否有新版本
            updateManager.onCheckForUpdate(res => {
                //有新版本
                if (res.hasUpdate) {
                    //显示模态对话框
                    wx.showModal({
                        title: "更新提示",
                        content: "有新版本正在下载中!"
                    })
                }
                else {
                    console.log("没有新版本需要更新，进行游戏登录...");
                    //没有新版本需要更新，进行游戏登录
                    self.login();
                }
            });

            //监听版本更新事件。下载完成后回调
            updateManager.onUpdateReady(() => {
                wx.showModal({
                    title: "更新提示",
                    content: "新版本已经准备好，是否重启应用？",
                    showCancel: false,
                    //showModal调用成功
                    success: function (res) {
                        //点击确定按钮
                        if (res.confirm) {
                            //强制小程序重启并使用新版本
                            updateManager.applyUpdate();
                            //进行登录
                            self.login();
                        }
                    }
                })
            });

            //监听小程序更新失败事件
            updateManager.onUpdateFailed(() => {
                wx.showModal({
                    title: "更新提示",
                    content: "新版本下载失败，请删除图标重新搜索",
                    showCancel: false,
                    success: (res) => {
                        if (res.confirm) {
                            //退出当前小游戏
                            wx.exitMiniProgram({
                                success: () => {
                                    console.log("成功退出当前小游戏!");
                                },
                                fail: () => {
                                    console.log("退出当前小游戏失败！");
                                }
                            });
                        }
                    }
                })
            })
        }
    }

    /**
     * 用户登录
     */
    login() {
        console.log("开始进行登录...");

        let self = this;

        //检查登录态是否过期
        wx.checkSession({
            //登录态没有过期，即已登录
            success: () => {
                console.log("登录态没有过期");
                //直接开始进入游戏
                self.loginSuccess();
            },
            //登录态过期
            fail: () => {
                console.log("登录态过期");
                //调用登录域授权
                self.getAuthorizeOfUserInfo();
            }
        })


    }

    /**
     * 得到用户信息的授权   
     */
    private getAuthorizeOfUserInfo() {
        let self = this;

        //获得登录凭证
        wx.login({
            //成功获得用户登录凭证res
            success: (res) => {
                console.log("登录凭证：", res);
                //判断当前版本是否可以使用createUserInfoButton
                //版本>=2.0.1之后不支持getUserInfo
                if (typeof wx.createUserInfoButton === 'function') {
                    console.log("createUserInfoButton");
                    this.createUserInfoButton();
                }
                else {
                    //获取用户信息，调用前需要用户授权
                    wx.getUserInfo({
                        //用户未授权
                        fail: (res) => {
                            // iOS 和 Android 对于拒绝授权的回调 errMsg 没有统一，需要做一下兼容处理
                            if (res.errMsg.indexOf('auth deny') > -1 || res.errMsg.indexOf('auth denied') > -1) {
                                // 处理用户拒绝授权的情况
                                self.setWXSetting();
                            } else {
                                //直接进入游戏
                                self.loginSuccess();
                            }
                        }
                    })
                }
            }
        });
    }

    /**
     * 创建获取用户信息按钮，进行登录授权和保存用户信息userInfo于本地
     */
    private createUserInfoButton() {
        console.log("开始创建 获得用户信息按钮...");

        let self = this;

        //获得设备信息
        let systemInfo = wx.getSystemInfoSync();
        let w = systemInfo.windowWidth;
        let h = systemInfo.windowHeight;
        console.log("设备信息：", systemInfo);

        //创建获取用户信息按钮
        let button = wx.createUserInfoButton({
            type: 'text',
            text: '点击屏幕登录',       //按钮上的文本
            style: {        //按钮样式
                left: 0,
                top: 0,
                width: w,   //按钮全屏
                height: h,
                lineHeight: h,
                backgroundColor: '#000000',
                color: '#ffffff',
                textAlign: 'center',
                fontSize: 40,
                borderRadius: 4
            }
        });

        //监听按钮点击事件 
        button.onTap((res) => {
            if (!res.userInfo) {
                console.log(res.errMsg);
                return;
            }

            console.log("点击用户信息按钮后得到的数据：", res);

            // iOS 和 Android 对于拒绝授权的回调 errMsg 没有统一，需要做一下兼容处理
            if (res.errMsg.indexOf('auth deny') > -1 || res.errMsg.indexOf('auth denied') > -1) {
                // 处理用户拒绝授权的情况
                self.setWXSetting();
            } else {
                // 保存用户信息
                wx.setStorageSync('userInfo', res.userInfo);

                //隐藏登录按钮
                button.hide();
                button.destroy();
                //直接进入游戏
                self.loginSuccess();
            }
        });

    }

    /**
     * 设置用户授权设置
     */
    private setWXSetting() {
        let self = this;

        //获得用户的当前设置
        wx.getSetting({
            success: (res) => {
                console.log("当前用户的授权设置：", res);

                let authSetting = res.authSetting;
                if (authSetting["scope.userInfo"] === true) {
                    //用户已授权，可以直接调用相关API
                    //直接进入游戏
                    self.loginSuccess();
                }
                else if (authSetting["scope.userInfo"] === false) {
                    // 用户已拒绝授权，再调用相关 API 或者 wx.authorize 会失败，需要引导用户到设置页面打开授权开关
                    // 打开用户设置界面
                    wx.openSetting({
                        success: (res) => { }
                    })
                }
                else {
                    // 未询问过用户授权，调用相关 API 或者 wx.authorize 会弹窗询问用户
                    if (typeof wx.authorize === "function") {
                        //向用户发起授权请求。如果用户之前已经同意授权，则不会出现弹窗，直接返回成功。
                        // 支持版本 >= 1.2.0
                        wx.authorize({
                            scope: 'scope.record',
                            fail: function (res) {
                                // iOS 和 Android 对于拒绝授权的回调 errMsg 没有统一，需要做一下兼容处理
                                if (res.errMsg.indexOf('auth deny') > -1 || res.errMsg.indexOf('auth denied') > -1) {
                                    // 处理用户拒绝授权的情况
                                    // 打开用户设置界面
                                    wx.openSetting({
                                        success: (res) => { }
                                    })
                                }
                            }
                        });
                    }
                }
            }
        })
    }

    /**
     * 发布事件登录成功
     */
    private loginSuccess() {
        console.log("游戏登录成功！");

        let openid: string = DataStorage.ins.getStorageSync("openid");
        if (openid) {
            console.log("本地有openid");
            Global.ins.openid = openid;
            EventManager.ins.sendEvent(EventType.GotOpenId)
        }
        else {
            console.log("本地没有openid，用云函数获取");
            WXCloud.ins.getOpenId((openid, appid) => {
                Global.ins.openid = openid;
                DataStorage.ins.setStorage("openid", openid);
                EventManager.ins.sendEvent(EventType.GotOpenId)
            })
        }

        EventManager.ins.sendEvent(EventType.LoginSuccess);

    }
}
