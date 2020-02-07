import Player from "../player";
import PropertyOfPlayer from "../property";

export default abstract class PlayerState {

    protected player: Player;
    protected property: PropertyOfPlayer;

    setPlayer(player: Player) {
        this.player = player;
        this.property = player.property;
    }

    /**
     * 移动键被点击
     * @param dir 1为右
     */
    abstract moveBut(dir: number);

    /**
     * 移动键被释放
     */
    abstract releaseMoveBut();

    /**
     * 跳跃键被点击
     */
    abstract jumpBut();

    /**
     * 速度向下
     */
    abstract downSpeed();

    /**
     * 速度向上
     */
    abstract upSpeed();

    /**
     * 开始碰撞
     */
    abstract beginContact();

    /**
     * 结束碰撞
     */
    abstract endContact();

    /**
     * 受到冲力
     */
    abstract impulsion();

    /**
     * 死亡
     */
    dead() {
        this.player.setState(Player.deadState);
    }

    /**
     * 进入该状态
     */
    abstract enter()

    /**
     * 退出该状态
     */
    abstract exit()
}

