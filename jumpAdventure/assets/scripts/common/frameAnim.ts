
const { ccclass, property, disallowMultiple, menu } = cc._decorator;

@ccclass
@disallowMultiple()
@menu('自定义组件/FrameAnim')
export default class FrameAnimation extends cc.Component {

    @property({
        displayName: "播放速度",
        tooltip: "多少秒播放一帧"
    })
    private playSpeed: number = 0.1;

    @property(cc.SpriteAtlas)
    private atlas: cc.SpriteAtlas = null;
    @property()
    private playOnLoad: boolean = false;
    @property()
    private isLoop: boolean = false;

    private sprite: cc.Sprite = null;
    private isPlay: boolean = false;
    /**
     * 当前是哪一帧
     */
    private Index: number = -1;
    /**
     * 当前播放时间
     */
    private timeSum = 0;
    private _spriteFrames: cc.SpriteFrame[] = null;
    /**
     * 取帧的方向
     */
    private dir: number = 1;
    /**
     * 是否暂停了
     */
    private isPuase: boolean = false;
    private callBack: Function = null;
    private idleImg: cc.SpriteFrame = null;

    onLoad() {
        this.sprite = this.node.getComponent(cc.Sprite);

        if (this.playOnLoad && this.atlas) {
            this.setSpriteAtlas(this.atlas);
            this.play(this.isLoop);
        }
    }

    start() {
    }

    /**
     * 正在播放
     */
    isPlaying(): boolean {
        return this.isPlay;
    }

    /**
     * 设置播放速度
     * @param t 多少秒一帧
     */
    setSpeed(t: number) {
        this.playSpeed = t;
    }

    setIdleImg(img: cc.SpriteFrame) {
        this.idleImg = img;
    }

    setSpriteAtlas(atlas: cc.SpriteAtlas) {
        this._spriteFrames = atlas.getSpriteFrames();
    }

    /**
     * 播放帧动画，停止播放现有动画
     * @param isLoop 是否循环播放
     */
    play(isLoop: boolean = false, callBack: Function = null) {
        this.stop();
        this.isLoop = isLoop;
        this.dir = 1;
        this.callBack = callBack;

        this.setSpriteFrame(this.getFrameFormArray());
        this.isPlay = true;
    }

    /**
     * 停止播放
     */
    stop() {
        if (!this.isPlay)
            return;

        this.isPlay = false;
        this.Index = -1;
        this.timeSum = 0;
        this.isPuase = false;
        this.callBack = null;

        if (this.idleImg)
            this.setSpriteFrame(this.idleImg);
    }

    /**
     * 暂停播放
     */
    puase() {
        this.isPlay = false;
        this.isPuase = true;
    }

    /**
     * 继续播放
     */
    continue() {
        if (this.isPuase) {
            this.isPlay = true;
            this.isPuase = false;
        }
    }

    setSpriteFrame(img: cc.SpriteFrame) {
        this.sprite.spriteFrame = img;
    }

    /**
     * 从帧数组里取得接下来要播的一帧
     * @returns null表示一轮播完
     */
    private getFrameFormArray(): cc.SpriteFrame {
        this.Index += this.dir;
        if (this.Index >= this._spriteFrames.length || this.Index < 0)
            return null;

        return this._spriteFrames[this.Index];
    }

    update(dt) {
        if (this.isPlay) {
            this.timeSum += dt;
            if (this.timeSum >= this.playSpeed) {
                this.timeSum = 0;

                let f: cc.SpriteFrame = this.getFrameFormArray();
                if (f === null) {
                    //一轮播完
                    if (this.isLoop) //要循环播放
                        this.Index = -1;
                    else {
                        if (this.callBack)
                            this.callBack();
                        this.stop();
                    }
                }
                else {
                    this.sprite.spriteFrame = f;
                }
            }
        }
    }
}
