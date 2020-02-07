import EventManager, { EventType } from "../modules/eventManager/eventManager";
import MyComponent from "../common/myComponent";

const { ccclass, property } = cc._decorator;

@ccclass
class BackGround extends cc.Component {

    @property({ displayName: "移动速度" })
    private speed: number = 10;

    private bg1: cc.TiledLayer;
    private bg2: cc.TiledLayer;
    private map: cc.TiledMap;
    private mapSize: cc.Size;
    private bg2Size: cc.Size;

    private isActive: boolean = false;

    onLoad() {
        // EventManager.ins.onEvent(EventType.ActiveRunBackGround, this.active, this);
    }

    start() {
        this.active();
    }

    private active() {
        this.map = this.node.getComponent(cc.TiledMap);
        this.mapSize = this.getMapSize();

        this.bg1 = this.map.getLayer("bg1");
        this.bg2 = this.map.getLayer("bg2");
        if (!this.bg1 || !this.bg2) {
            console.warn("没有背景节点");
            return;
        }

        this.bg2Size = this.getBg2Size();
        this.bg2.node.y = this.bg2Size.height;

        this.isActive = true;
    }

    private getBg2Size(): cc.Size {
        let t: cc.Size = this.map.getTileSize();
        return new cc.Size(this.mapSize.width, t.height * 4);
    }

    private getMapSize(): cc.Size {
        let n: cc.Size = this.map.getMapSize();
        let s: cc.Size = this.map.getTileSize();
        return new cc.Size(n.width * s.width, n.height * s.height);
    }

    update(dt) {
        if (this.isActive) {
            let l: number = dt * this.speed;
            this.bg1.node.y -= l;
            this.bg2.node.y -= l;
            if (this.bg2.node.y <= 0) {
                this.bg2.node.y = this.bg2Size.height;
                this.bg1.node.y = 0;
            }
        }
    }

    onDestroy() {
        // EventManager.ins.deleteSubscriber(this);
    }
}
