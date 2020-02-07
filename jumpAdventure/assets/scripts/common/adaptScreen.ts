const { ccclass, property, disallowMultiple, menu } = cc._decorator;

//屏幕适配策略选无

@ccclass
@disallowMultiple
@menu("自定义组件/AdaptScreen")
export default class AdaptScreen extends cc.Component {

    @property({
        type: cc.Node,
        tooltip: "自动缩放使UI面板内容全部显示在屏幕中"
    })
    private proportionallyShowNode: cc.Node[] = [];

    @property({
        type: cc.Node,
        tooltip: "设置节点大小为适配后的设计分辨率大小，例如mask、背景等"
    })
    private fullScreenNodeBySize: cc.Node[] = [];

    @property({
        type: cc.Node,
        tooltip: "设置节点缩放为适配后的设计分辨率大小"
    })
    private fullScreenNodeByScale: cc.Node[] = [];


    private canvas: cc.Canvas = null;
    /**原始设计分辨率 */
    private originDesSize: cc.Size = null;
    /**适配后设计分辨率 */
    private adaptedDesSize: cc.Size = null;

    onLoad() {
        this.canvas = this.node.getComponent(cc.Canvas);

        //适配只需要将分辨率比例改成设备比例就行了
        let frame: cc.Size = cc.view.getCanvasSize();
        let design: cc.Size = cc.view.getDesignResolutionSize();
        this.originDesSize = design.clone();
        this.adaptedDesSize = design.clone();

        //固定高度
        let r: number = frame.width / frame.height;
        this.adaptedDesSize.width = this.adaptedDesSize.height * r;

        this.canvas.designResolution = this.adaptedDesSize;
        this.adaptNode();
        console.log("适配后设计分辨率：", this.canvas.designResolution);
    }

    /**适配Node */
    private adaptNode() {
        //设计分辨率适配前后的缩放比例
        let wr: number = this.adaptedDesSize.width / this.originDesSize.width;
        let hr: number = this.adaptedDesSize.height / this.originDesSize.height;
        //为了图形不变形和全部显示在屏幕上，选择最小缩放比例
        let r: number;
        if (wr > hr)
            r = hr;
        else
            r = wr;

        let n: cc.Node;
        for (n of this.proportionallyShowNode) {
            n.scale = r;
        }

        //全屏显示
        for (n of this.fullScreenNodeBySize) {
            n.height = this.adaptedDesSize.height;
            n.width = this.adaptedDesSize.width;
        }

        for (n of this.fullScreenNodeByScale) {
            n.scaleX = wr;
            n.scaleY = hr;
        }
    }

}
