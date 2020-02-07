import Global from "../../modules/global";

export default class WXCloud {

    static ins: WXCloud = null;

    /**
     * 云能力初始化
     * @param env 云环境 
     */
    static init(env: string) {
        if (!this.ins) {
            this.ins = new WXCloud();
            wx.cloud.init(env, true);
            this.ins.db = wx.cloud.database({
                env: env,
                throwOnNotFound: false
            });
            // this.ins.userCollection = this.ins.db.collection("User");
            // if (this.ins.userCollection)
            //     console.error("没有找到集合User");
            console.log("完成模块WXCloud的初始化");
        }
        else
            console.warn("重复初始化");
    }

    /**数据库引用 */
    private db = null;
    // private userCollection = null;

    getOpenId(callFunc: (openid, appid) => void) {
        wx.cloud.callFunction({
            name: "getOpenId",
            success: res => {
                console.log("getOpenId调用成功,res:", res);
                callFunc(res.result.openid, res.result.appid);
            },
            fail: err => {
                console.log("getOpenId调用失败");
                console.log(err);
            },
        })
    }

    Query(key: string, success: (res) => void) {
        this.db.collection("User").where({
            "_id": key
        }).get({
            success: (res) => {
                console.log("查询成功", "key:", key, "res:", res);
                if (res.data.length === 0)
                    success(null);
                else
                    success(res.data[0].data);
            },
            fail: (e) => {
                console.warn(`查询${key}失败。${e}`);
            }
        });
    }

    update(key: string, data: any) {
        this.db.collection("User").doc(key).update({
            data: {
                "data": data
            },
            success: () => {
                console.log(`更新记录成功:${key}:`, data);
            },
            fail: (e) => {
                console.error(`更新记录失败:${key}:`, data, e);
            }
        })
    }

    add(key: string, data: any) {
        this.db.collection("User").add({
            data: {
                "_id": key,
                "data": data
            },
            success: () => {
                console.log(`增加记录成功:${key}:`, data);
            },
            fail: (e) => {
                console.error(`增加记录失败:${key}:`, data, e);
            }
        })
    }
}