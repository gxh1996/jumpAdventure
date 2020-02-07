import UserBlock from "../res/prefabs/userBlock";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Launch extends cc.Component {

    @property({ type: cc.Prefab })
    private userBlockPre: cc.Prefab = null;

    /**
     * 用户信息块列表
     */
    private userBlockList: UserBlock[] = [];

    start() {
        let self = this;

        // wx.removeUserCloudStorage({
        //     keyList: ["score", "scoreSum"],
        //     success: () => {
        //         console.log("删除用户托管数据！");
        //     }
        // })

        //接收主域发来的消息 data:{type,value}
        wx.onMessage(data => {
            console.log("收到主域发来的消息:", data);

            switch (data.type) {
                case 'score': { //上传分数
                    self.updateScore(data.value);
                    break;
                }
                case "friend": { //刷新排行榜
                    self.updateRankingList();
                    break;
                }
            }
        })
    }

    /**
     * 更新成绩，保存最高分
     * @param newScore 
     */
    private updateScore(newScore: number) {
        let self = this;

        wx.getUserCloudStorage({
            keyList: ["score"],
            success: (data) => {
                console.log("得到的用户云数据：", data);

                let oldScore: number;
                if (data.KVDataList.length > 0) {
                    oldScore = JSON.parse(data.KVDataList[0].value);//[value...]
                }
                else {//当前该用户还没有托管数据
                    oldScore = 0;
                }

                //存储更高的分数
                if (newScore > oldScore) {
                    self.setUserCloudStorage("score", JSON.stringify(newScore));
                    console.log("保存数据：", newScore);
                }
            },
            fail: () => {
                console.error("对用户托管数据进行读操作失败!");
            }
        })
    }

    /**
     * 更新排行榜
     */
    private updateRankingList() {
        let self = this;
        console.log("开始更新排行榜...");

        wx.getFriendCloudStorage({
            keyList: ["score"],
            success: (data) => {
                console.log("好友托管数据：", data); //至少有一个自己
                let list: UserGameData[] = self.getUGDOfTop(data.data, 9);
                console.log("排行靠前的用户：list", list);
                let n: number = self.userBlockList.length - list.length;

                //更新用户信息块的数量
                if (n < 0) {
                    console.log("用户信息块不够,n:", n);
                    n = -n;
                    for (let i = 0; i < n; i++) {
                        let ub: UserBlock = this.createUserBlock();
                        self.userBlockList.push(ub);
                    }
                }
                else if (n > 0)
                    for (let i = 0; i < n; i++) {
                        let ub: UserBlock = self.userBlockList.pop();
                        ub.node.removeFromParent();
                        ub.node.destroy();
                    }

                if (list.length !== self.userBlockList.length) {
                    console.error("用户信息块数量不够，请处理！");
                    return;
                }
                //写入用户数据
                for (let i = 0; i < list.length; i++) {
                    let score: string = this.getValueFromKVDataList(list[i].KVDataList, "score");
                    self.userBlockList[i].init(i + 1, score, list[i]);
                }

                console.log("好友排行榜更新完成!useerBlockList", self.userBlockList);
            },
            fail: () => {
                console.error("wx.getFriendCloudStorage()失败！");
            }
        })
    }


    /**
     * 得到得分排行靠前的UserGameData
     * @param userGameData userGameData[]
     * @param n 返回靠前的几个数据
     * @returns UserGameData[]
     */
    private getUGDOfTop(userGameDatas: UserGameData[], n: number): UserGameData[] {
        let self = this;

        if (userGameDatas.length === 1) { //只有自己一个玩家
            if (this.hasKeyInKVDataList(userGameDatas[0].KVDataList, "score"))
                return userGameDatas;
            else
                return [];
        }

        console.log("开始排序...");

        //倒序排序
        userGameDatas.sort(function (a: UserGameData, b: UserGameData): number {
            //这里要默认第一个元素为分数
            let v1: number = Number(self.getValueFromKVDataList(a.KVDataList, "score"));
            let v2: number = Number(self.getValueFromKVDataList(b.KVDataList, "score"));
            if (v1 === v2)
                return 0;
            else if (v1 < v2)
                return -1;
            else
                return 1;
        });
        let list = userGameDatas.slice(0, n - 1);
        return list;
    }
    /**
     * 从KVData列表中找出指定KVData.key的KVData，返回其KVData.value
     * @param KVDataList KVData数据列表
     * @param key KVData.key
     * @returns KVData.value 
     */
    private getValueFromKVDataList(KVDataList: KVData[], key: string): string {
        let v: string = null;
        let e;
        for (e of KVDataList)
            if (e.key === key) {
                v = e.value;
                break;
            }
        if (v === null)
            console.error(`在KVDataList中没有找到key为${key}的KVData，请处理！`, e);
        return v;
    }

    /**
     * 是否存在键值为key的数据
     */
    private hasKeyInKVDataList(KVDataList: KVData[], key: string): boolean {
        let ret: boolean = false;

        if (KVDataList.length > 0) {
            let e;
            for (e of KVDataList)
                if (e.key === key) {
                    ret = true;
                    break;
                }

            if (e.value === null)
                ret = false;
        }
        return ret;
    }

    /**
     * 向blockRoot下添加userBlock。
     */
    private createUserBlock(): UserBlock {
        let node: cc.Node = cc.instantiate(this.userBlockPre);
        this.node.addChild(node);
        let ub: UserBlock = node.getComponent("userBlock");
        return ub;
    }

    /**
     * 对用户托管数据进行写操作
     */
    private setUserCloudStorage(key: string, value: string) {
        wx.setUserCloudStorage({
            KVDataList: [{ key: key, value: value }],
            fail: () => {
                console.error("对用户托管数据进行写操作失败！");
            }
        })
    }

}
