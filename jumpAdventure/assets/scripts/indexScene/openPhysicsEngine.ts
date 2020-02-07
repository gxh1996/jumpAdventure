const { ccclass, property } = cc._decorator;

@ccclass
export default class OpenPhysicsEngine extends cc.Component {

    @property({})
    private isDebug: boolean = false;

    @property({})
    private gravity: cc.Vec2 = new cc.Vec2(0, 0);

    private pMgr: cc.PhysicsManager;

    onLoad() {
        this.pMgr = cc.director.getPhysicsManager();

        //设置物理引擎参数
        this.pMgr.enabled = true;
        this.debug();
        this.pMgr.gravity = this.gravity;
    }

    private debug() {
        if (this.isDebug) {
            //开启调试信息
            let Bits: any = cc.PhysicsManager.DrawBits;//这是我们要显示的类型信息
            this.pMgr.debugDrawFlags = Bits.e_jointBit | Bits.e_shapeBit | Bits.e_centerOfMassBit;
        }
        else {
            //关闭调试
            this.pMgr.debugDrawFlags = 0;
        }
    }

}
