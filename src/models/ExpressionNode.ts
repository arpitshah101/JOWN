export class ExpressionNode {

	public expression: String;
	public left: ExpressionNode;
	public right: ExpressionNode;

	constructor (expr: String, left: ExpressionNode, right: ExpressionNode) {
		this.expression = expr;
		this.left = left;
		this.right = right;
	}
}
