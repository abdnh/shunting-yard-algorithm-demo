class Operator {
    constructor(op, callback, operandsNum, precedence, pos) {
        this.op = op;
        this.callback = callback;
        this.operandsNum = operandsNum;
        this.precedence = precedence;
        this.pos = pos;
    }

    toString() {
        return `Operator(op='${this.op}', operandsNum=${this.operandsNum}, precedence=${this.precedence}, pos=${this.pos})`;
    }
}

class Operand {
    constructor(value, pos) {
        this.value = value;
        this.pos = pos;
    }

    toString() {
        return `Operand(value=${this.value}, pos=${this.pos})`;
    }
}

class EvalError extends Error {
    constructor(message) {
        super(message);
        this.name = 'EvalError';
    }
}

function abort() {
    throw new EvalError("BUG: Calling a callback on parentheses");
}

function multiply(op1, op2) {
    return op1 * op2;
}

function divide(op1, op2) {
    return op1 / op2;
}

function add(op1, op2) {
    return op1 + op2;
}

function subtract(op1, op2) {
    return op1 - op2;
}

function power(base, exponent) {
    return Math.pow(base, exponent);
}

function modulo(op1, op2) {
    return op1 % op2;
}

function factorial(op1) {
    let n = 1;
    for (let i = 2; i <= op1; i++) {
        n *= i;
    }
    return n;
}

function sqrt(x) {
    return Math.sqrt(x);
}

function ln(x) {
    return Math.log(x);
}

function log_base(base, x) {
    Math.log(x) / Math.log(base);
}

function pi_constant() {
    return Math.PI;
}

function e_constant() {
    return Math.E;
}

let operators = [
    new Operator("(", abort, 0, 0),
    new Operator(")", abort, 0, 0),
    new Operator("*", multiply, 2, 2),
    new Operator("/", divide, 2, 2),
    new Operator("+", add, 2, 3),
    new Operator("-", subtract, 2, 3),
    new Operator("^", power, 2, 1),
    new Operator("%", modulo, 2, 1),
    new Operator("!", factorial, 1, 1),
    new Operator("sqrt", sqrt, 1, 1),
    new Operator("ln", ln, 1, 1),
    new Operator("log", log_base, 2, 1),
    new Operator("PI", pi_constant, 0, 0),
    new Operator("e", e_constant, 0, 0),
];

function getOperator(expr) {
    let current = null;
    let cur_cand_len = 0;
    for (let i = 0; i < operators.length; i++) {
        let j;
        for (j = 0; operators[i].op[j] && j < expr.length; j++) {
            if (operators[i].op[j].toLowerCase() != expr[j].toLowerCase())
                break;
        }
        if (j >= operators[i].op.length) {
            if (j > cur_cand_len) {
                current = operators[i];
                cur_cand_len = j;
            }
        }
    }

    return current;
}

class EvalData {
    constructor(ops = new Array(), output = new Array()) {
        this.ops = Array.from(ops);
        this.output = Array.from(output);
    }
}

class EvalStep {
    constructor(data, callback) {
        this.data = data;
        this.callback = callback;
    }

    execute() {
        this.callback(this.data);
    }
}

class EvalDemo {

    constructor(expr, ctx) {
        this.expr = expr;
        this.data = new EvalData();
        this.steps = new Array();
        this.currentStep = 0;
        this.paused = false;
        this.setCanvasCtx(ctx);
        try {
            this.eval();
        } catch (err) {
            let statusText = err.message;
            this.registerStep(new EvalData(this.data.ops, this.data.output), data => {
                this.draw({},
                    [statusText],
                    "red");
            });
        }

    }

    setCanvasCtx(ctx) {
        this.ctx = ctx;
        ctx.font = 'bold 16px sans-serif';
    }

    registerStep(data, callback) {
        let step = new EvalStep(data, callback);
        this.steps.push(step);
    }

    next() {
        if (this.paused || this.currentStep >= this.steps.length) return false;

        let step = this.steps[this.currentStep];
        this.data = step.data;
        step.execute();
        this.currentStep++;

        return true;
    }

    undo() {
        if (this.currentStep <= 0) return;
        this.currentStep -= 2;
        if (this.currentStep >= 0) {
            this.next();
        } else {
            this.currentStep = 0;
        }
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    finished() {
        return this.currentStep >= this.steps.length;
    }

    draw(
        markedElements = {
            operations: new Set(),
            output: new Set(),
        },
        statusText = [],
        statusTextColor = 'green'
    ) {
        const offsetX = 150;
        let offsetY = 100;
        const rectWidth = 40;
        const rectHeight = 35;
        const gapX = 20;
        const gapY = 100;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        function drawArray(label, array) {
            ctx.textAlign = 'left';
            ctx.fillText(getString(label), 10, offsetY + rectHeight / 2 + 5, offsetX - 10);
            ctx.textAlign = 'center';
            let j = 0;
            for (let i = 0; i < array.length; i++) {
                ctx.strokeStyle = 'black';
                if (offsetX + j * (rectWidth + gapX) + rectWidth > ctx.canvas.width) {
                    offsetY += rectHeight + gapY;
                    j = 0;
                }
                ctx.strokeRect(offsetX + j * (rectWidth + gapX), offsetY, rectWidth, rectHeight);
                if (array[i] != undefined && array[i] != null) {
                    let elementText = array[i].op !== undefined ? array[i].op : array[i].value.toLocaleString(undefined, { maximumFractionDigits: 2 });
                    elementText = force_ltr(elementText);
                    ctx.fillText(elementText, offsetX + j * (rectWidth + gapX) + rectWidth / 2, offsetY + rectHeight / 2 + 5, rectWidth);
                    if (markedElements[label] && markedElements[label].has(i)) {
                        ctx.strokeStyle = 'red';
                        ctx.strokeRect(offsetX + j * (rectWidth + gapX), offsetY, rectWidth, rectHeight);
                    }
                }
                ctx.fillText(i, offsetX + j * (rectWidth + gapX) + rectWidth / 2, offsetY + rectHeight + 20, rectWidth);
                j++;
            }
        }

        ctx.save();
        ctx.textAlign = 'left';
        this.ctx.fillStyle = 'blue';
        ctx.fillText(getString("evaluatingExpression", this.expr), 10, offsetY);
        ctx.restore();

        offsetY += gapY;
        drawArray("operations", this.data.ops);
        offsetY += gapY;
        drawArray("output", this.data.output);

        offsetY += gapY;
        ctx.save();
        ctx.textAlign = 'left';
        ctx.fillStyle = statusTextColor;
        for (let text of statusText) {
            let y = offsetY + rectHeight / 2 + 5;
            if (y >= ctx.canvas.height) {
                this.warning = getString("canvasHeightWarning");
            }
            ctx.fillText(text, 10, y);
            offsetY += gapY / 2;
        }
        ctx.restore();
    }

    _parseNum(i) {
        let j = i;
        while (this.expr[j] >= '0' && this.expr[j] <= '9') {
            j++;
        }
        if (this.expr[j] === '.') j++;
        while (this.expr[j] >= '0' && this.expr[j] <= '9') {
            j++;
        }

        return [j, Number.parseFloat(this.expr.slice(i, j))];
    }

    _evalOpFromStack() {

        let oldData = new EvalData(this.data.ops, this.data.output);

        let operator = this.data.ops.pop();
        let opIndex = oldData.ops.length - 1;

        let res = 0;
        if (operator.operandsNum == 0) {
            let statusText = getString("evaluatingConstant", operator.op);
            this.registerStep(new EvalData(oldData.ops, oldData.output), data => {
                this.draw({
                    operations: new Set([opIndex])
                }, [
                    statusText
                ]);
            });
            res = operator.callback();
        }
        if (operator.operandsNum == 1) {
            if (this.data.output.length == 0) {
                throw new EvalError(getString("expectedOperandForUnary", operator.op));
            }
            let operand_1 = this.data.output.pop().value;
            let output_index = oldData.output.length - 1;
            let statusText = getString("evaluatingUnaryOperation", operator.op, operand_1);
            this.registerStep(new EvalData(oldData.ops, oldData.output), data => {
                this.draw({
                    operations: new Set([opIndex]),
                    output: new Set([output_index]),
                }, [
                    statusText
                ]);
            });
            res = operator.callback(operand_1);
        } else if (operator.operandsNum == 2) {
            if (this.data.output.length == 0) {
                throw new EvalError(getString("expectedOperandForBinary", operator.op));
            }
            let op2 = this.data.output[this.data.output.length - 1];
            let op1;
            if (this.data.output.length < 2 &&
                !(op2 && op2.pos > operator.pos &&
                    (operator.op === "+" || operator.op === "-"))

            ) {
                throw new EvalError(getString("notValidAsUnary", operator.op));
            }
            op2 = this.data.output.pop();
            op1 = this.data.output.pop();
            let val_2 = op2 ? op2.value : 0;
            let val_1 = op1 ? op1.value : 0;
            let opr2_idx = oldData.output.length - 1;
            let opr1_idx = oldData.output.length - 2;
            let statusText = getString("evaluatingOperation", operator.op, val_1, val_2);
            this.registerStep(new EvalData(oldData.ops, oldData.output), data => {
                this.draw({
                    operations: new Set([opIndex]),
                    output: new Set([opr1_idx, opr2_idx]),
                }, [
                    statusText
                ]);
            });
            res = operator.callback(val_1, val_2);
        }

        this.data.output.push(new Operand(res, Number.MAX_SAFE_INTEGER));
        let outputIndex = this.data.output.length - 1;
        let statusText = getString("pushingOperationResult", res.toString());
        this.registerStep(new EvalData(this.data.ops, this.data.output), data => {
            this.draw({
                output: new Set([outputIndex]),
            }, [
                statusText
            ]);
        });

    }

    eval() {
        let expr = this.expr;
        let operator;
        for (let i = 0; i < expr.length; i++) {
            let [j, n] = this._parseNum(i);
            if (!Number.isNaN(n)) {
                let opr = new Operand(n, i);
                this.data.output.push(opr);
                i += j - i - 1;
                let lastIndex = this.data.output.length - 1;
                let statusText = getString("pushingOperand", n);
                this.registerStep(new EvalData(this.data.ops, this.data.output), data => {
                    this.draw({
                        output: new Set([lastIndex])
                    }, [
                        statusText
                    ]);
                });
            }
            else if ((operator = getOperator(expr.slice(i)))) {
                if (operator.op === "(") {
                    this.data.ops.push(operator);
                    let lastIndex = this.data.ops.length - 1;
                    let statusText = getString("pushingOperator", operator.op, operator.operandsNum);
                    this.registerStep(new EvalData(this.data.ops, this.data.output), data => {
                        this.draw({
                            operations: new Set([lastIndex])
                        }, [
                            statusText
                        ]);
                    });
                }
                else if (operator.op === ")") {
                    let topOp = null;
                    let foundParens = false;
                    while (this.data.ops.length > 0) {
                        topOp = this.data.ops[this.data.ops.length - 1];
                        if (topOp.op === "(") {
                            foundParens = true;
                            break;
                        }
                        this._evalOpFromStack();
                    }
                    if (!foundParens) {
                        throw new EvalError(getString("mismatchedParentheses"));
                    } else {
                        let opIndex = this.data.ops.length - 1;
                        let statusText = getString("discardLeftParenthesis", operator);
                        this.registerStep(new EvalData(this.data.ops, this.data.output), data => {
                            this.draw({
                                operations: new Set([opIndex])
                            }, [
                                statusText
                            ]);
                        });
                        this.data.ops.pop();
                    }
                }
                else {
                    let topOp = null;
                    while ((topOp = this.data.ops[this.data.ops.length - 1]) &&
                        operator.precedence >= topOp.precedence &&
                        topOp.op !== "(") {
                        this._evalOpFromStack();
                    }

                    operator.pos = i;
                    this.data.ops.push(operator);
                    let opIndex = this.data.ops.length - 1;
                    let statusText = getString("pushingOperator", operator.op, operator.operandsNum);
                    this.registerStep(new EvalData(this.data.ops, this.data.output), data => {
                        this.draw({
                            operations: new Set([opIndex])
                        }, [
                            statusText
                        ]);
                    });
                }
                i += operator.op.length - 1;
            }
            else if (!/\s/.test(expr[i])) {
                throw new EvalError(getString("invalidSyntax"));
            }
        }

        while (this.data.ops.length > 0) {
            let topOp = this.data.ops[this.data.ops.length - 1];
            if (topOp.op === ")" || topOp.op === "(") {
                throw new EvalError(getString("mismatchedParentheses"));
            }
            this._evalOpFromStack();
        }

        if (this.data.output.length == 0) {
            return;
        }
        if (this.data.output.length > 1) {
            // excess operands
            throw new EvalError(getString("invalidSyntax"));
        }

        let outputIndex = this.data.output.length - 1;
        let res = this.data.output[outputIndex].value;
        let statusText = getString("expressionResult", res.toString());
        this.registerStep(new EvalData(this.data.ops, this.data.output), data => {
            this.draw({
                output: new Set([outputIndex]),
            }, [
                statusText
            ]);
        });
    }
}
