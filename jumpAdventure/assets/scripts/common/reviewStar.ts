const { ccclass, property } = cc._decorator;

@ccclass
export default class ReviewStar extends cc.Component {

    private stars: cc.Node[] = null;

    onLoad() {
        this.stars = this.node.children;
    }

    review(r: number) {
        let i;

        for (i = 0; i < r; i++)
            this.stars[i].opacity = 255;

        for (; i < 3; i++)
            this.stars[i].opacity = 50;
    }
}
