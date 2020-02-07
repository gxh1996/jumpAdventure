import Page from "./page";
import DataManager from "../../modules/dataManager";
import EventManager, { EventType } from "../../modules/eventManager/eventManager";
import HorizelScrollPage from "./horizelScrollView";
import ResManager from "../../modules/resManager/resManager";
import DebugUtil, { DebugKey } from "../../modules/debugUtil";
import Global from "../../modules/global";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SelectPanel extends cc.Component {

    @property(cc.Label)
    private starNum: cc.Label = null;

    @property(HorizelScrollPage)
    private horizelScrollPage: HorizelScrollPage = null;

    private emptyPage: cc.Prefab = null;

    private dataMgr: DataManager;
    private eventMgr: EventManager;
    private resMgr: ResManager;

    /**
     * 星星能得到的总数
     */
    private starSum: number;

    /**
     * 每个页面可以放几个关卡块
     */
    private readonly num: number = 15;
    /**关卡数 */
    private levelSum: number;
    /**页面数 */
    private pageSum: number;
    /**记录用户数据和配置数据是否都得到了 */
    private initC: number = 0;

    onLoad() {
        this.dataMgr = DataManager.ins;
        this.eventMgr = EventManager.ins;
        this.resMgr = ResManager.ins;

        this.eventMgr.onEventOnce(EventType.InitConfigComplete, this.init, this);
        this.eventMgr.onEventOnce(EventType.InitUserDataComplete, this.init, this);
        // this.eventMgr.onEventOnce(EventType.InitSelectPanel, this.init, this);

        this.eventMgr.onEvent(EventType.OpenSelectLevelPanel, this.open, this);
        this.eventMgr.onEvent(EventType.CloseSelectLevelPanel, this.close, this);

        this.node.on("updatePageContent", this.updatePageContent, this);

    }

    start() {
        if (!Global.ins.isFirstInitSelectPanel)
            this.init();
    }

    /**
     * 初始化选关面板
     */
    private init() {
        if (Global.ins.isFirstInitSelectPanel) {
            this.initC++;
            console.log("选关面板...", this.initC);
            if (this.initC < 2)
                return;
            Global.ins.isFirstInitSelectPanel = false;
        }

        this.emptyPage = this.resMgr.getRes("prefabs/ui/selectPanel/page", cc.Prefab);

        this.starSum = this.dataMgr.levelSum * 3;
        this.levelSum = this.starSum / 3;
        this.pageSum = Math.ceil(this.levelSum / this.num);
        this.createPage();
        this.freshShowedStar();

        //初始化完成后
        this.node.setPosition(0, 0);
        this.node.active = false;

        DebugUtil.ins.log(DebugKey.GameLogic, "选关面板初始化完成");
    }
    /**
     * 创建和初始化页面
     */
    private createPage() {
        this.horizelScrollPage.init(this.emptyPage, this.pageSum);

        let pages: cc.Node[] = this.horizelScrollPage.getPages();
        for (let i = 0; i < pages.length; i++)
            this.setPage(pages[i], i);

    }
    /**
     * 刷新显示的星星数
     */
    private freshShowedStar() {
        this.starNum.string = `(${this.dataMgr.getedStarSum()}/${this.starSum})`;
    }
    /**
     * 将页面page设为页面i
     */
    private setPage(page: cc.Node, i: number) {
        let p: Page;
        p = page.getComponent("page");
        let d: number[] = this.getLevelOfPage(i);
        p.init(d[0], d[1]);
    }
    /**
     * 得到页面i的关卡范围
     * @param i 0开始
     */
    private getLevelOfPage(i: number): number[] {
        let startI: number = 1 + this.num * i;
        let endI: number;
        if (i === this.pageSum - 1) {
            //最后一页
            endI = this.levelSum;
        }
        else
            endI = startI + this.num - 1;
        return [startI, endI];
    }

    private open() {
        this.eventMgr.sendEvent(EventType.OpenPanel, this.node);
    }

    private close() {
        this.eventMgr.sendEvent(EventType.ClosePanel, this.node);
    }

    private updatePageContent(e: cc.Event.EventCustom) {
        let n: cc.Node = e.detail[0];
        let i: number = e.detail[1];
        this.setPage(n, i);
    }

    onDestroy() {
        /* -------------------取消事件监听--------------------- */
        this.eventMgr.deleteSubscriber(this);
    }
}
