import EventManager, { EventType } from "../../modules/eventManager/eventManager";
import Global from "../../modules/global";
import ResManager from "../../modules/resManager/resManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Level extends cc.Component {

    @property(cc.Label)
    private levelNum: cc.Label = null;

    @property(cc.Button)
    private button: cc.Button = null;

    @property({
        type: [cc.Vec2],
        tooltip: "3个星星的坐标"
    })
    private starPs: cc.Vec2[] = [];

    private resMgr: ResManager;

    private star: cc.Prefab;
    /**
     * 第几关
     */
    private num: number;
    /**
     * 当前星星数
     */
    private starNum: number;
    /**
     * 星星节点数组
     */
    private starArr: cc.Node[] = [];

    onLoad() {
        this.resMgr = ResManager.ins;

        this.setClickEvent();
    }

    /**
     * 设置关卡块的显示
     * @param num 关卡号
     * @param enable 该关卡是否能进入
     * @param starNum 得到的星星,默认0
     */
    init(num: number, enable: boolean, starNum: number = 0) {
        this.num = num;

        this.star = this.resMgr.getRes("prefabs/ui/selectPanel/star", cc.Prefab);

        this.levelNum.string = num.toString();

        if (enable === false)
            this.button.interactable = false;

        if (starNum > 3) {
            console.error("信息数量错误");
            return;
        }

        this.showStar(starNum);
    }

    /**
     * 显示星星
     * @param n 星星个数
     */
    private showStar(n: number) {
        let i: number;
        let node: cc.Node
        while (this.starArr.length < n) {
            //星星数不够，补充星星，加入节点并设置其位置
            node = this._getStar();
            i = this.starArr.push(node) - 1;
            node.setPosition(this.starPs[i]);
        }

        //刷新星星的显示
        for (i = 0; i < this.starArr.length; i++) {
            if (i + 1 <= n)
                this.starArr[i].active = true;
            else
                this.starArr[i].active = false;
        }

        this.starNum = n;
    }
    private _getStar(): cc.Node {
        let n: cc.Node = cc.instantiate(this.star);
        this.node.addChild(n);
        return n;
    }

    /**
     * 设置点击事件
     */
    private setClickEvent() {
        if (this.button.clickEvents.length > 0) {
            console.error("已有点击事件");
            return;
        }

        let clickEvent: cc.Component.EventHandler = new cc.Component.EventHandler();
        clickEvent.target = this.node;
        clickEvent.component = "level";
        clickEvent.handler = "clickEvent";
        this.button.clickEvents.push(clickEvent);
    }

    /**
     * 点击事件
     */
    clickEvent() {
        console.log(`点击关卡${this.num}`);
        Global.ins.curLevelNum = this.num;
        EventManager.ins.sendEvent(EventType.LoadGameScene);
    }

}
