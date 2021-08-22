const speedLabel = document.getElementById("speed-label");
const expressionInputLabel = document.getElementById("expr-label");
const canvasWidthLabel = document.getElementById("canvas-width-label");
const canvasHeightLabel = document.getElementById("canvas-height-label");
const langSelectLabel = document.getElementById("lang-select-label");
const langSelect = document.getElementById("lang-select");
const langSwitcher = document.getElementById("lang-switcher");
const description = document.getElementById("description");
const title = document.getElementsByTagName("title")[0];
const opListSummary = document.getElementById("op-list-summary");

let currentLang = "en";

let langStrings = {
    "en": {
        name: "English",
        dir: "ltr",
        stepBack: "Step Back",
        stepForward: "Step Forward",
        resume: "Resume",
        pause: "Pause",
        play: "Play",
        animationSpeed: "Animation Speed",
        height: "Height:",
        width: "Width:",
        changeCanvasSize: "Change Canvas Size",
        expressionInputLabel: "Mathematical expression to evaluate:",
        langSelectLabel: "Switch Language:",
        langSwitcherFloat: "right",
        canvasHeightWarning: "Canvas is not high enough to draw all data - Adjust its height from the controls to the left",
        discardLeftParenthesis: "popping left parenthesis",
        mismatchedParentheses: "mismatched parentheses",
        invalidSyntax: "invalid syntax",
        operations: "operations",
        output: "output",
        description: 'A demo of the <a href="https://en.wikipedia.org/wiki/Shunting-yard_algorithm">Shunting-yard algorithm</a>',
        title: "A demo of the Shunting-yard algorithm",
        opListSummary: "Supported operations",
        pushingOperand: function (n) {
            return `pushing operand ${n} to output stack`;
        },
        pushingOperator: function (op, operandsNum) {
            let label = (operandsNum > 0 || (op.indexOf(')') !== -1 || op.indexOf('(') !== -1)) ? "operator" : "constant";
            return `pushing ${label} '${op}' to operations stack`;
        },
        evaluatingConstant: function (op) {
            return `evaluating constant '${op}'`;
        },
        evaluatingUnaryOperation: function (op, operand) {
            let expr;
            if (op === "!") {
                expr = `'${operand}${op}'`;
            } else {
                expr = `'${op}(${operand})'`;
            }
            expr = force_ltr(expr);
            return `evaluating operation ${expr}`;
        },
        evaluatingOperation: function (op, opr1, opr2) {
            let expr = force_ltr(`${opr1} ${op} ${opr2}`);
            return `evaluating operation '${expr}'`;
        },
        pushingOperationResult: function (res) {
            return `pushing operation result '${res}' to output stack`;
        },
        expressionResult: function (res) {
            return `expression evaluation finished. result is '${res}'`;
        },
        expectedOperandForUnary: function (op) {
            return `found no operand for operator '${op}', which takes one operand`;
        },
        expectedOperandForBinary: function (op) {
            return `found no operands for operator '${op}', which takes two operands`;
        },
        notValidAsUnary: function (op) {
            let msg = `operator '${op}' is not valid as unary`;
            if (op.indexOf('+') !== -1 || op.indexOf('-') !== -1) {
                msg += ' here';
            }
            return msg;
        },
        evaluatingExpression: function (expr) {
            return `Evaluating "${expr}"`;
        },
    },
    "ar": {
        name: "العربية",
        dir: "rtl",
        stepBack: "الرجوع بخطوة",
        stepForward: "التقدم بخطوة",
        resume: "استمرار",
        pause: "إيقاف",
        play: "تشغيل",
        animationSpeed: "سرعة العرض",
        height: "الارتفاع:",
        width: "العرض:",
        changeCanvasSize: "تغيير حجم مساحة الرسم",
        expressionInputLabel: "التعبير الرياضي الذي تريد حسابه:",
        langSelectLabel: "تغيير اللغة:",
        langSwitcherFloat: "left",
        canvasHeightWarning: "ارتفاع مساحة الرسم غير كافٍ لرسم كل البيانات - اضبط ارتفاعها من الخيارات على اليمين",
        discardLeftParenthesis: "طرح القوس الأيسر",
        mismatchedParentheses: "هناك أقواس ناقصة",
        invalidSyntax: "هناك خطأ في التعبير",
        operations: "مكدس العمليات",
        output: "مكدس المخرجات",
        description: 'استعراض لخوارزمية <a href="https://en.wikipedia.org/wiki/Shunting-yard_algorithm">Shunting-yard</a>',
        title: "استعراض لخوارزمية Shunting-yard",
        opListSummary: "العمليات المدعومة",
        pushingOperand: function (n) {
            return `دفع المعامل ${n} إلى مكدس المخرجات`;
        },
        pushingOperator: function (op, operandsNum) {
            let label = (operandsNum > 0 || (op.indexOf(')') !== -1 || op.indexOf('(') !== -1)) ? "العملية" : "الثابت";
            return `دفع ${label} '${op}' إلى مكدس العمليات`;
        },
        evaluatingConstant: function (op) {
            return `حساب الثابت '${op}'`;
        },
        evaluatingUnaryOperation: function (op, operand) {
            let expr;
            if (op === "!") {
                expr = `'${operand}${op}'`;
            } else {
                expr = `'${op}(${operand})'`;
            }
            expr = force_ltr(expr);
            return `حساب العملية ${expr}`;
        },
        evaluatingOperation: function (op, opr1, opr2) {
            let expr = force_ltr(`${opr1} ${op} ${opr2}`);
            return `حساب العملية '${expr}'`;
        },
        pushingOperationResult: function (res) {
            return `دفع نتيجة العملية '${res}' إلى مكدس المخرجات`;
        },
        expressionResult: function (res) {
            return `تم حساب نتيجة التعبير. النتيجة هي '${res}'`;
        },
        expectedOperandForUnary: function (op) {
            return `تعذر إيجاد معامل لعملية '${op}'، والتي تأخذ معاملا واحدا`;
        },
        expectedOperandForBinary: function (op) {
            return `تعذر إيجاد معاملات لعملية '${op}'، والتي تأخذ معاملين`;
        },
        notValidAsUnary: function (op) {
            let msg = `العملية '${op}' غير صالحة كعملية أحادية`;
            if (op.indexOf('+') !== -1 || op.indexOf('-') !== -1) {
                msg += ' هنا';
            }
            return msg;
        },
        evaluatingExpression: function (expr) {
            return `حساب التعبير "${expr}"`;
        },
    }
}

function setLang(lang) {
    if (!langStrings.hasOwnProperty(lang)) return;
    currentLang = lang;
    let strings = langStrings[lang];
    document.documentElement.lang = lang;
    document.body.dir = strings.dir;
    stepBackButton.textContent = strings.stepBack;
    stepForwardButton.textContent = strings.stepForward;
    resumeButton.textContent = strings.resume;
    playButton.textContent = strings.play;
    canvasDimensionsButton.textContent = strings.changeCanvasSize;
    expressionInputLabel.textContent = strings.expressionInputLabel;
    speedLabel.textContent = strings.animationSpeed;
    canvasWidthLabel.textContent = strings.width;
    canvasHeightLabel.textContent = strings.height;
    langSelectLabel.textContent = strings.langSelectLabel;
    langSwitcher.style.float = strings.langSwitcherFloat;
    description.innerHTML = strings.description;
    title.textContent = strings.title;
    opListSummary.textContent = strings.opListSummary;
}

function force_ltr(s) {
    return `\u200e${s}\u200e`;
}

function getString(name) {
    let prop = langStrings[currentLang][name];
    if (typeof prop === "function") {
        return prop(...Array.from(arguments).slice(1).map(e => {
            if (typeof e === "string") {
                return force_ltr(e);
            } else return e;
        }));
    }
    else {
        return prop;
    }
}

function detectLang() {
    let params = (new URL(document.location)).searchParams;
    let paramLang = params.get("lang");
    if (paramLang) {
        setLang(paramLang);
    }
    else if (navigator.language.startsWith('ar')) {
        setLang("ar");
    }
}

function populateLangSelector() {
    for (let [lang, strings] of Object.entries(langStrings)) {
        let option = document.createElement("option");
        option.value = lang;
        option.textContent = strings.name;
        langSelect.appendChild(option);
        if (currentLang === lang) {
            option.selected = true;
        }
    }
    langSelect.addEventListener("input", () => {
        setLang(langSelect.value);
    });
}

detectLang();
populateLangSelector();
