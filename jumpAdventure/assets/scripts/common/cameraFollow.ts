import MathUtil from "./mathUtil";
import MyComponent from "./myComponent";
import EventManager, { EventType } from "../modules/eventManager/eventManager";
import DebugUtil, { DebugKey } from "../modules/debugUtil";
import Global from "../modules/global";

const { ccclass, property, disallowMultiple, menu } = cc._decorator;

@ccclass
@disallowMultiple
@menu("自定义组件/CameraFollow")
export default class Follow extends cc.Component {

    @property({
        type: cc.Node,
        displayName: "跟随目标"
    })
    private target: cc.Node = null;

    @property(cc.TiledMap)
    private map: cc.TiledMap = null;

    /**
     * 跟随者移动的最大范围,世界坐标
     */
    private range = null;
    private _isFollow: boolean = false;
    private get isFollow(): boolean {
        return this._isFollow;
    }
    private set isFollow(v: boolean) {
        this._isFollow = v;
    }

    /**
     * 是否检测角色超出摄像机范围
     */
    private isCheckOF: boolean = false;

    onLoad() {
        let self = this;
        EventManager.ins.onEvent(EventType.StartCameraFollow, () => { self.isFollow = true; }, this);
        EventManager.ins.onEvent(EventType.StopCameraFollow, () => { self.isFollow = false; }, this);
        EventManager.ins.onEvent(EventType.CheckPlayerOutFace, this.checkPlayerOutFace, this);
        // EventManager.ins.onEvent(EventType.InitCamera, this.init, this);
        // EventManager.ins.onEvent(EventType.ResetGame, () => {
        //     self.isFollow = false;
        //     self.isCheckOF = false;
        // }, this);
    }

    start() {
        this.init();
    }

    private init() {
        this.initConfig();
        this.isFollow = true;
        this.isCheckOF = false;
    }

    private initConfig() {
        //计算摄像机的可移动范围
        let viewSize: cc.Size = cc.view.getVisibleSize();
        let tc: cc.Size = this.map.getMapSize();
        let ts: cc.Size = this.map.getTileSize();
        //地图大小
        let ms: cc.Size = new cc.Size(tc.width * ts.width, tc.height * ts.height);

        // console.log("可见区域", viewSize);
        // console.log("地图大小", ms);
        //地图坐标
        let mapP: cc.Vec2 = this.getNodeP(this.map.node);

        //地图节点描点在中心
        // this.range = {
        //     minY: mapP.y - ms.height / 2 + viewSize.height / 2,
        //     maxY: mapP.y + ms.height / 2 - viewSize.height / 2,
        //     minX: mapP.x - ms.width / 2 + viewSize.width / 2,
        //     maxX: mapP.x + ms.width / 2 - viewSize.width / 2
        // }
        //地图节点描点在左中
        this.range = {
            minY: mapP.y - ms.height / 2 + viewSize.height / 2,
            maxY: mapP.y + ms.height / 2 - viewSize.height / 2,
            minX: mapP.x + viewSize.width / 2,
            maxX: mapP.x + ms.width - viewSize.width / 2
        }

        //设计分辨率宽大于地图宽时
        if (this.range.minX > this.range.maxX) {
            let t: number = this.range.minX;
            this.range.minX = this.range.maxX;
            this.range.maxX = t;
        }

        console.log("摄像机移动范围", this.range);
    }

    /**
     * 将其他节点坐标系的坐标转为本节点坐标系坐标
     * @param self 
     */
    private getNodeP(self: cc.Node): cc.Vec2 {
        let p: any = this.node.parent.convertToNodeSpaceAR(MathUtil.getWorldCoordinate(self));
        return p;
    }

    private checkPlayerOutFace() {
        DebugUtil.ins.log(DebugKey.GameLogic, "开始检测角色是否出屏幕");
        this.isCheckOF = true;
    }

    /**是否超出界面 */
    private isOutFace(): boolean {
        let p: cc.Vec2 = MathUtil.getWorldCoordinate(this.node);
        let screen: cc.Size = cc.view.getVisibleSize();
        let rect: cc.Rect = new cc.Rect();
        rect.x = p.x - screen.width / 2;
        rect.y = p.y - screen.height / 2;
        rect.width = screen.width;
        rect.height = screen.height;

        let tar: cc.Rect = this.target.getBoundingBoxToWorld();
        if (tar.yMax < rect.yMin || tar.yMin > rect.yMax || tar.xMax < rect.xMin || tar.xMin > rect.xMax)
            return true;
        return false;
    }

    update(dt) {
        if (this.isCheckOF) {
            if (this.isOutFace()) {
                DebugUtil.ins.log(DebugKey.GameLogic, "角色出屏幕");
                this.isCheckOF = false;
                EventManager.ins.sendEvent(EventType.PlayerOutFace);
            }

        }

        if (this.isFollow) {
            let p: cc.Vec2 = this.getNodeP(this.target);
            if (p.equals(this.node.getPosition()))
                return;

            if (p.x > this.range.maxX)
                p.x = this.range.maxX;
            else if (p.x < this.range.minX)
                p.x = this.range.minX;

            if (p.y > this.range.maxY)
                p.y = this.range.maxY;
            else if (p.y < this.range.minY)
                p.y = this.range.minY;

            this.node.setPosition(p);
        }
    }

    onDestroy() {
        EventManager.ins.deleteSubscriber(this);
    }

}
