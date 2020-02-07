const { ccclass, property } = cc._decorator;

@ccclass
export default class UserBlock extends cc.Component {

    @property({ type: cc.Label })
    private no: cc.Label = null;

    @property({ type: cc.Sprite })
    private image: cc.Sprite = null;

    @property({ type: cc.Label })
    private username: cc.Label = null;

    @property({ type: cc.Label })
    private score: cc.Label = null;

    /**
     * 初始化 用户显示块
     * @param no 排名
     * @param score 分数
     * @param userGameData UserGameData
     */
    init(no: number, score: string, userGameData: any) {
        let self = this;
        //设置排名显示
        this.no.string = no.toString();
        //设置昵称的显示
        this.username.string = userGameData.nickname;
        //设置分数的显示
        this.score.string = score;
        //设置头像的显示
        cc.loader.load({ url: userGameData.avatarUrl, type: 'png' }, (e, r) => {
            if (e) {
                console.error(e);
                return;
            }
            self.image.spriteFrame = new cc.SpriteFrame(r);
        })
    }
}
