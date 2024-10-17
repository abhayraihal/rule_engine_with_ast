const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const jsep = require('jsep');
const cors = require('cors');
// const serviceAccount = require('./firebaseServiceAccountKey.json');

// Initialize Firebase Admin SDK
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://<your-project-id>.firebaseio.com"
// });

// const db = admin.firestore();

class Node {
    constructor(type, value = null) {
        this.type = type; // "operator" or "operand"
        this.value = value; // Value for operand nodes (e.g., number for comparisons)
        this.left = null; // Left child
        this.right = null; // Right child for operators
    }
}

function createRule(ruleString) {
    // Replace '=' with '===' for equality checks
    const query = ruleString.replace(/=/g, '===');

    // Parse the query
    const ast = jsep(query);
    
    return ast;
}

function parseRule(rule) {
    // Use JSEP to parse the rule string into an AST
    rule = rule.replace(/=/g, '===');
    return jsep(rule);
}

function countOperators(asts) {
    const counts = { AND: 0, OR: 0 };
    asts.forEach(ast => {
        // Traverse the AST to count operators
        traverseAST(ast, counts);
    });
    return counts;
}

function traverseAST(ast, counts) {
    if (ast.type === 'CallExpression' && counts[ast.callee.name] !== undefined) {
        counts[ast.callee.name]++;
    }
    if (ast.body) {
        ast.body.forEach(node => traverseAST(node, counts));
    }
    if (ast.arguments) {
        ast.arguments.forEach(node => traverseAST(node, counts));
    }
}

function combineASTs(asts) {
    if (asts.length === 0) return null;

    // const operatorCounts = countOperators(asts);
    // const mainOperator = operatorCounts.AND >= operatorCounts.OR ? 'AND' : 'OR';

    return combineWithOperator(asts, 'OR');
}

function combineWithOperator(asts, operator) {
    const combinedAST = {
        type: "Compound",
        body: [],
    };

    asts.forEach(ast => {
        combinedAST.body.push(ast);
        combinedAST.body.push({ type: "Identifier", name: operator });
    });

    // Remove the last operator as it's not needed
    combinedAST.body.pop();

    return combinedAST;
}

function combineRules(ruleStrings) {
    const asts = ruleStrings.map(parseRule);
    return combineASTs(asts);
}



function evaluateExpression(expr, data) {
    if (expr.type === 'Identifier') {
        return data[expr.name];
    } else if (expr.type === 'Literal') {
        return expr.value;
    }
    return null; // Handle unexpected cases
}

function evaluateCall(callee, argumentsResult) {
    if (callee === 'AND') {
        return argumentsResult.every(arg => arg === true);
    } else if (callee === 'OR') {
        return argumentsResult.some(arg => arg === true);
    }
    return null; // Handle unexpected cases
}

function evaluateBinary(operator, left, right) {
    switch (operator) {
        case '>':
            return left > right;
        case '<':
            return left < right;
        case '===':
            return left === right;
        // Add more operators as needed
        default:
            throw new Error(`Unknown operator: ${operator}`);
    }
}

function combineResults(prevResult, currentResult, operator) {
    if (prevResult === null) {
        return currentResult; // First result
    }
    switch (operator) {
        case 'AND':
            return prevResult && currentResult;
        case 'OR':
            return prevResult || currentResult;
        default:
            return currentResult; // Fallback
    }
}

function evaluateRule(AST, data) {
    if (AST.type === 'Compound') {
        let result = null;
        let currentOperator = null;

        for (const node of AST.body) {
            if (node.type === 'Compound') {
                // Recursively evaluate the inner compound
                const innerResult = evaluateRule(node, data);
                result = combineResults(result, innerResult, currentOperator);
            } else if (node.type === 'Identifier') {
                // Update current operator
                currentOperator = node.name;
            } else if (node.type === 'SequenceExpression') {
                // Evaluate expressions in the sequence
                let sequenceResult = null;
                for (const expression of node.expressions) {
                    const exprResult = evaluateExpression(expression, data);
                    sequenceResult = combineResults(sequenceResult, exprResult, currentOperator);
                }
                result = combineResults(result, sequenceResult, currentOperator);
            } else if (node.type === 'CallExpression') {
                // Evaluate the call expression
                const argumentsResult = node.arguments.map(arg => evaluateExpression(arg, data));
                const callResult = evaluateCall(node.callee.name, argumentsResult);
                result = combineResults(result, callResult, currentOperator);
            }
        }

        return result !== null ? result : false; // Default to false if no result
    }
    
    return false; // Default case
}

// async function saveRuleToFirebase(ruleId, ruleString, AST) {
//     try {
//         await db.collection('rules').doc(ruleId).set({
//             ruleString,
//             AST,
//             createdAt: admin.firestore.FieldValue.serverTimestamp(),
//         });
//         console.log('Rule saved successfully!');
//     } catch (error) {
//         console.error('Error saving rule:', error);
//     }
// }


const app = express();

app.use(cors());
app.use(bodyParser.json()); // Parse JSON request bodies

app.post('/create-rule', (req, res) => {
    const { rule } = req.body;
    // console.log("received: ", rule);
    try {
        const ast = createRule(rule);
        res.json({ ast });
    } catch (error) {
        res.status(400).json({ message: 'Invalid rule string', error });
    }
});

app.post('/combine-rules', (req, res) => {
    const { rules } = req.body;
    // console.log("Input request: ", rules)
    try {
        const combinedAST = combineRules(rules);
        res.json({ combinedAST });
    } catch (error) {
        res.status(400).json({ message: 'Invalid rules', error });
    }
});

app.post('/evaluate-rule', (req, res) => {
    const { AST, data } = req.body;
    try {
        const result = evaluateRule(AST, data);
        res.json({ result });
    } catch (error) {
        res.status(400).json({ message: 'Error evaluating rule', error });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}/`);
});

app.get('/', (req, res) => {
  res.send("Rule Engine API is running");
});
