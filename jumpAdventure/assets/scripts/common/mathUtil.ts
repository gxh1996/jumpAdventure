import { DIR } from "./commonVar";

export default class MathUtil {

    /**求和 */
    static sumOfArray(arr: number[]): number {
        let sum: number = 0;
        for (let i of arr)
            sum += i;
        return sum;
    }

    static removeItemFromArray(item: any, array: any[]) {
        let i = array.indexOf(item);
        array.splice(i, 1);
    }

    /**
     * 得到自身世界坐标
     * @param self 
     */
    static getWorldCoordinate(self: cc.Node): cc.Vec2 {
        let t: any = self.convertToWorldSpaceAR(cc.v2(0, 0));
        return t;
    }

    /**
     * 世界坐标转为节点坐标
     * @param parent 
     * @param wp 
     */
    static getNodePFromWP(parent: cc.Node, wp: cc.Vec2): cc.Vec2 {
        let v: any = parent.convertToNodeSpaceAR(wp);
        return v;
    }

    static getRandomInteger(min: number, max: number): number {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    /**
     * 二者发生碰撞时，self在other左边还是右边
     * @returns -1：左边、1：右边、0：都不是
     */
    static relativeLocationHoriz(self: cc.PhysicsBoxCollider, other: cc.PhysicsBoxCollider, deviation: number = 3): number {
        let ret: number = 0;
        //self
        let t: any = self.getAABB();
        let sRe: cc.Rect = t;
        //other
        t = other.getAABB();
        let oRe: cc.Rect = t;

        //垂直方向
        let dev: number;
        if (sRe.yMin >= oRe.yMax || sRe.yMax <= oRe.yMin)
            ret = 0;
        else {
            if (Math.abs(sRe.xMax - oRe.xMin) < deviation)
                ret = -1;
            else if (Math.abs(sRe.xMin - oRe.xMax) < deviation)
                ret = 1;
        }
        return ret;
    }

    /**
     * 二者发生碰撞时，self在other上面还是下面
     * @deviation 误差,默认3
     * @returns -1：下面、1：上面、0：都不是
     */
    static relativeLocationVertical(self: cc.PhysicsBoxCollider, other: cc.PhysicsBoxCollider, deviation: number = 3): number {
        let ret: number = 0;

        //self
        let t: any = self.getAABB();
        let sRe: cc.Rect = t;

        //other
        t = other.getAABB();;
        let oRe: cc.Rect = t;

        //水平方向二者是否在一起
        let dev: number;
        if (sRe.xMax <= oRe.xMin || sRe.xMin >= oRe.xMax)
            ret = 0;
        //垂直方向上
        else {
            if (Math.abs(sRe.yMax - oRe.yMin) < deviation)
                ret = -1;
            else if (Math.abs(sRe.yMin - oRe.yMax) < deviation)
                ret = 1;
        }

        return ret;
    }

    /**self于other的相对方向 */
    static getRelativeDir(self: cc.PhysicsBoxCollider, other: cc.PhysicsBoxCollider): DIR {
        let t: any = self.getAABB();
        let s: cc.Rect = t;
        t = other.getAABB();
        let o: cc.Rect = t;
        if (this.inRow(s, o)) {
            if (s.x < o.x)
                return DIR.left;
            else
                return DIR.right;
        }
        else if (this.inColumn(s, o)) {
            if (s.y < o.y)
                return DIR.down;
            else
                return DIR.up;
        }
        return null;
    }

    /**
     * self是否在other d方向上
     * @param self 
     * @param other 
     * @param d 
     */
    static isSide(self: cc.PhysicsBoxCollider, other: cc.PhysicsBoxCollider, d: DIR): boolean {
        let t: any = self.getAABB();
        let s: cc.Rect = t;
        t = other.getAABB();
        let o: cc.Rect = t;

        switch (d) {
            case DIR.down:
                if (this.inColumn(s, o) && s.center.y < o.center.y)
                    return true;
                break;
            case DIR.up:
                if (this.inColumn(s, o) && s.center.y > o.center.y)
                    return true;
                break;
            case DIR.left:
                if (this.inRow(s, o) && s.center.x < o.center.x)
                    return true;
                break;
            case DIR.right:
                if (this.inRow(s, o) && s.center.x > o.center.x)
                    return true;
        }

        return false;
    }
    /**
     * 在同一行
     */
    static inRow(s: cc.Rect, o: cc.Rect): boolean {
        if (s.yMax <= o.yMin + 3 || s.yMin >= o.yMax - 3)
            return false;
        return true;
    }
    static inColumn(s: cc.Rect, o: cc.Rect): boolean {
        if (s.xMin >= o.xMax - 3 || s.xMax <= o.xMin + 3)
            return false;
        return true;
    }

    /**
     * 随机一个力
     * @param min 最小力
     * @param max 最大力
     * @param minDegree 力的最小角度
     * @param maxDegree 力的最大角度
     */
    static getRandomForce(min: number, max: number, minDegree: number, maxDegree: number): cc.Vec2 {
        let f: number = MathUtil.getRandomInteger(min, max);
        let d: number = MathUtil.getRandomInteger(minDegree, maxDegree);
        let x: number = f * Math.cos(d);
        let y: number = f * Math.sin(d);
        return cc.v2(x, y);
    }

    /**
     * 随机二选一
     */
    static getRandomSelect(): number {
        let r: number = Math.random();
        if (r > 0.5)
            return 1;
        else
            return -1;
    }

    /**
     * 返回一个对象的大小 
     */
    static lenOfObject(obj: Object): number {
        let sum: number = 0;
        let v: any;
        for (v in obj) {
            sum++;
        }
        return sum;
    }
}