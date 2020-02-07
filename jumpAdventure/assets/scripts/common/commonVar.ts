//通用类，类型，变量

const { ccclass, property } = cc._decorator;

/**动画播放模式 */
export let WrapMode = cc.Enum({
    Default: cc.WrapMode.Default,
    Loop: cc.WrapMode.Loop,
    LoopReverse: cc.WrapMode.LoopReverse,
    Normal: cc.WrapMode.Normal,
    PingPong: cc.WrapMode.PingPong,
    PingPongReverse: cc.WrapMode.PingPongReverse,
    Reverse: cc.WrapMode.Reverse
})

export let Dir = cc.Enum({
    left: 0,
    right: 1,
    up: 2,
    down: 3
})

export enum DIR { left, right, up, down }

/**
 * 机关攻击角色的数据
 */
export class HitData {
    /**
     * 冲力
     */
    force: cc.Vec2;
    /**
     * 旋转角度
     */
    rotate: number;

    constructor(f?: cc.Vec2, r?: number) {
        this.force = f;
        this.rotate = r;
    }
}

/**
 * 给与角色额外速度信息
 */
export class GiveExtraSpeed {
    /**
     * 谁给的
     */
    readonly who: string;
    /**
     * 速度
     */
    readonly v: cc.Vec2;

    constructor(who: string, v: cc.Vec2) {
        this.who = who;
        this.v = v;
    }
}

/**
 * 碰撞信息
 */
export class ContactInfo {
    contact: cc.PhysicsContact;
    self: cc.PhysicsCollider;
    other: cc.PhysicsCollider;
    constructor(c: cc.PhysicsContact, s: cc.PhysicsCollider, o: cc.PhysicsCollider) {
        this.contact = c;
        this.self = s;
        this.other = o;
    }
}

/**
 * 检测二碰撞体是否结束碰撞
 * @param self 
 * @param other 
 * @param deviation 误差
 * @returns true if end contact 
 */
export function OnEndContact(self: cc.PhysicsBoxCollider, other: cc.PhysicsBoxCollider, deviation: number = 3): boolean {
    let t: any = self.getAABB();
    let selfBox: cc.Rect = t;
    t = other.getAABB();
    let otherBox: cc.Rect = t;
    let isEndContact: boolean = true;

    //水平判断
    if (Math.abs(selfBox.xMax - otherBox.xMin) < deviation || Math.abs(selfBox.xMin - otherBox.xMax) < deviation)
        isEndContact = false;

    //垂直判断
    if (isEndContact) {
        if (Math.abs(selfBox.yMax - otherBox.yMin) < deviation || Math.abs(selfBox.yMin - otherBox.yMax) < deviation)
            isEndContact = false;
    }

    return isEndContact;
}

@ccclass("Segment")
export class Segment {
    @property()
    startP: cc.Vec2 = cc.v2();
    @property()
    endP: cc.Vec2 = cc.v2();
}

/**
 * 游戏配置json文件的接口
 */
export interface GameConfig {
    /**一共有多少关 */
    levelSum: number;
    /**关卡评分依据 */
    levelEvaluationConditions: { time: number, fruitSum: number }[];
}

/**
 * 玩家数据接口
 */
export interface UserData {
    /**每关得到的星星数 */
    getStars: number[];

}

/**
 * 关卡信息
 */
export class levelData {
    num: number;
    getStar: number;
    constructor(n: number, s: number) {
        this.num = n;
        this.getStar = s;
    }
}
