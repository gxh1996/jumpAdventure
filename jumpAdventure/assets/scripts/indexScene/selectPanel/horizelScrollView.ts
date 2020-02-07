
const { ccclass, property, disallowMultiple, menu, requireComponent } = cc._decorator;

/* ---------------------水平滚动页面----------------------- */

@ccclass
@disallowMultiple()
@menu('自定义组件/HorizelScrollView')
@requireComponent(cc.ScrollView)
export default class HorizelScrollPage extends cc.Component {


    @property(cc.Node)
    private content: cc.Node = null;

    @property({
        type: [cc.Component.EventHandler],
        displayName: "翻页事件"
    })
    private scrollEvents: cc.Component.EventHandler[] = [];


    private page: cc.Prefab = null;
    private scrollView: cc.ScrollView = null;

    /**content的初始位置，也是页面指针为1时的位置*/
    private initPosOfContent: cc.Vec2;
    private pageWidth: number;
    /**页面数值，也是内容节点的孩子节点*/
    private pages: cc.Node[] = null;
    private virtualMode: boolean = false;
    /**移动超过页面宽度百分比的长度就发生翻页*/
    private scrollThreshold: number = 0.4;
    /**翻页的时间*/
    private turnPageTime: number = 1;

    private curIdx: number = 0;
    private maxIdx: number = 0;

    /**实际页面指针*/
    private _curIdx: number = 0;
    /**实际最大页面数,为奇数*/
    private _maxPageNum: number = 3;
    /**中间页位置的坐标 */
    private PosOfMedianPage: cc.Vec2;
    /**中间页的实际页指针 */
    private idxOfMedianPage: number;

    /**超出界面后停止拖动 */
    private stopDragInOverFace: boolean = true;

    onLoad() {
        this.scrollView = this.node.getComponent(cc.ScrollView);
        this.pages = this.content.children;

        this.onEvent();
    }

    private onEvent() {
        this.node.on("touch-up", this.touchUp, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchCancel, this);
    }

    /**
     * 初始化列表，创建需要个数的页面
     */
    init(page: cc.Prefab, n: number) {
        this.page = page;
        this.curIdx = 0;
        this.maxIdx = -1;
        this._curIdx = 0;
        this.idxOfMedianPage = Math.floor(this._maxPageNum / 2);
        this.initPosOfContent = this.content.getPosition();
        this.pageWidth = this.page.data.width;
        this.PosOfMedianPage = this.getContentPos(this.idxOfMedianPage);

        this.setPageNum(n);
    }

    /**
     * 设置逻辑页面数量
     */
    setPageNum(n: number) {
        if (this.curIdx > n - 1) {
            console.error("无法设置页面数量，因为要删除的页面中有正在显示的");
            return;
        }

        if (n === this.getPageNum())
            return;

        /**实际需要页面数 */
        let _n: number = n > this._maxPageNum ? this._maxPageNum : n;
        if (this.pages.length !== _n) {
            if (this.pages.length > _n)
                this.deletePages(this.pages.length - _n);
            else if (this.pages.length < _n)
                this.addPages(_n - this.pages.length);
        }

        this.maxIdx = n - 1;

        if (this.getPageNum() > this._maxPageNum && !this.virtualMode)
            this.openVirtualMode();
        if (this.getPageNum() <= this._maxPageNum && this.virtualMode)
            this.closeVirtualMode();

    }

    /**
     * 逻辑页面数量
     */
    getPageNum(): number {
        return this.maxIdx + 1;
    }

    getPages(): cc.Node[] {
        return this.pages;
    }

    private horizelLayout() {
        let i: number;
        for (i = 0; i < this.pages.length; i++)
            this.pages[i].setPosition(this.getPagePos(i));
    }

    /**
     * 得到该页面坐标
     */
    private getPagePos(no: number): cc.Vec2 {
        return cc.v2(this.pageWidth / 2 + this.pageWidth * no);
    }

    private addPages(n: number) {
        let i: number;
        for (i = 0; i < n; i++)
            this.content.addChild(cc.instantiate(this.page));
    }

    /**
     * 从后面删除多个页面 
     */
    private deletePages(n: number) {
        let i: number;
        let p: number = this.pages.length - 1;
        for (i = 0; i < n; i++)
            this.content.removeChild(this.pages[p]);
    }

    private openVirtualMode() {
        this.virtualMode = true;
    }
    private closeVirtualMode() {
        this.virtualMode = false;
    }


    /**
     * 当显示页面i时Content的坐标
     * @param i 实际页面指针
     */
    private getContentPos(i: number): cc.Vec2 {
        return cc.v2(this.initPosOfContent.x - this.pageWidth * i, this.initPosOfContent.y);
    }

    /**
     * 得到显示页面i时相对于ScrollView水平方向的百分比位置上
     * @param i 实际指针
     * @returns percent 
     */
    private getPercent(i: number): number {
        //0显示第一个页面,1显示最后一个页面
        if (i === 0)
            return 0;
        else
            return i / (this.pages.length - 1);
    }

    /**
     * 滚动到当前实际指针指向的页面
     */
    private scrollToCurPage(): number {
        let curP: cc.Vec2 = this.content.getPosition();
        let t: number = Math.abs(this.getContentPos(this._curIdx).x - curP.x) / this.pageWidth * this.turnPageTime;
        this.scrollView.scrollToPercentHorizontal(this.getPercent(this._curIdx), t);
        return t;
    }

    /**
     * 需要给页面重新排序
     * @param dir 翻页方向 -1左
     */
    private needMovePage(dir: number): boolean {
        /**需要几个页面 */
        let needP: number;
        /**已有几个s */
        let haveP: number;
        if (dir === -1) {
            //左
            needP = this.curIdx;
            haveP = this._curIdx;
        }
        else if (dir === 1) {
            needP = this.maxIdx - this.curIdx;
            haveP = this.pages.length - 1 - this._curIdx;
        }
        //只能多不能少
        if (needP > haveP)
            return true;
        return false;
    }

    private dealScroll() {
        let self = this;
        let newP: cc.Vec2 = this.content.getPosition();
        let oldP: cc.Vec2 = this.getContentPos(this._curIdx);
        let dir: number = newP.x - oldP.x;
        let l: number = Math.abs(dir);
        let turnPage: boolean = l > this.pageWidth * this.scrollThreshold;

        if (turnPage) {
            //需要翻页
            if (dir > 0) {
                //向左
                if (this.curIdx === 0)
                    return;

                //可以向左翻页
                this.curIdx--;
                this._curIdx--;

                let t: number = this.scrollToCurPage();

                //修正真实页面
                if (this.virtualMode && this.needMovePage(-1) && this._curIdx !== this.idxOfMedianPage) {
                    this.scheduleOnce(() => {
                        //将最后一个页面放在最前面
                        let n: cc.Node = self.pages.pop();
                        self.pages.unshift(n);
                        self.scrollView.setContentPosition(self.PosOfMedianPage);
                        self.horizelLayout();

                        //这时我们要初始化这个页面
                        self.updatePageContent(n, self.curIdx - self.idxOfMedianPage);

                        self._curIdx = self.idxOfMedianPage;
                    }, t);
                }
            }
            else {
                //向右
                if (this.curIdx === this.maxIdx)
                    return;

                this.curIdx++;
                this._curIdx++;
                let t: number = this.scrollToCurPage();

                if (this.virtualMode && this.needMovePage(1) && this._curIdx !== this.idxOfMedianPage) {
                    this.scheduleOnce(() => {
                        //将第一个页面放在最后面
                        let n: cc.Node = self.pages.shift();
                        self.pages.push(n);
                        self.scrollView.setContentPosition(self.getContentPos(1));
                        self.horizelLayout();

                        //这时我们要初始化这个页面
                        self.updatePageContent(n, self.curIdx + self.idxOfMedianPage);

                        self._curIdx = self.idxOfMedianPage;
                    }, t);

                }
            }
        }
        else {
            //处于边界，scrollView会帮你还原
            if (this.curIdx === 0 && dir > 0 || this.curIdx === this.maxIdx && dir < 0)
                return;

            //还原
            let t: number = l / this.pageWidth * this.turnPageTime;
            this.scrollView.scrollToPercentHorizontal(this.getPercent(this._curIdx), t);
        }

        // console.log("当前显示的是页面", this.curIdx);
    }

    /**
     * 将该页面更新为页面no
     */
    private updatePageContent(node: cc.Node, no: number) {
        // console.error("待实现");

        let e: cc.Event.EventCustom = new cc.Event.EventCustom("updatePageContent", true);
        e.detail = [node, no];
        this.node.dispatchEvent(e);
    }


    /* ----------------------事件回调------------------------- */

    private touchUp() {
        // console.log("触摸结束");
        this.dealScroll();
    }

    private touchCancel() {
        console.log("touchCancel");
        this.dealScroll();
    }

    private scrollBegan() {
        console.log("scrollBegan");
    }

    private scrollEnded() {
        console.log("scrollEnded");
    }

    // private scrolling() {
    //     console.log("scrolling");
    // }

    update(dt) {

    }
}
