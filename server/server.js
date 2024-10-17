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

// Simplify the AST
function simplifyAST(node) {
    if (node.type === 'BinaryExpression') {
        if (node.left.type === 'BinaryExpression' || node.right.type === 'BinaryExpression') {
            // Recur for non-leaf nodes
            return {
                operator: node.operator,
                left: simplifyAST(node.left),
                right: simplifyAST(node.right)
            };
        } else {
            // Leaf nodes: only return the condition
            return {
                operator: node.operator,
                name: node.left.name,
                value: node.right.value
            };
        }
    }
    return node;  // Return unchanged if not BinaryExpression
}

function createRule(ruleString) {
    // Replace '=' with '===' for equality checks
    const query = ruleString
        .replace(/=/g, '===')
        .replace(/AND/g, '&&')
        .replace(/OR/g, '||');

    // Parse the query
    const ast = jsep(query);

    return simplifyAST(ast);
}

function parseRule(rule) {
    // Use JSEP to parse the rule string into an AST
    rule = rule
        .replace(/=/g, '===')
        .replace(/AND/g, '&&')
        .replace(/OR/g, '||');
    return simplifyAST(jsep(rule));
}

function combineASTs(asts) {
    if (asts.length === 0) return null;
    return combineWithOperator(asts, '&&');
}

function combineWithOperator(asts, operator) {
    if (asts.length === 0) return null;

    const combinedASTs = [...asts]; // Create a copy of the original array

    while (combinedASTs.length > 1) {
        // Pick the first two ASTs
        const left = combinedASTs.shift(); // Remove the first AST
        const right = combinedASTs.shift(); // Remove the second AST

        // Merge them into a new BinaryExpression
        const mergedAST = {
            operator: operator,
            left: left,
            right: right,
        };

        // Push the merged AST back into the array
        combinedASTs.push(mergedAST);
    }

    // Return the final combined AST
    return combinedASTs[0];
}

function combineRules(ruleStrings) {
    const asts = ruleStrings.map(parseRule);
    return combineASTs(asts);
}

function parseRule(rule) {
    rule = rule
        .replace(/=/g, '===')
        .replace(/AND/g, '&&')
        .replace(/OR/g, '||');
    return simplifyAST(jsep(rule));
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
        const ast = combineRules(rules);
        res.json({ ast });
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
