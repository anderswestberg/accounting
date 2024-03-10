"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateExpression = exports.substitueArgument = void 0;
const substitueArgument = (expression, variables) => {
    // Regular expression to match "${variable}" patterns
    const variableRegex = /{\$(.*?)}/g;
    // Replace each variable placeholder with its corresponding value
    const evaluatedExpression = expression.replace(variableRegex, (match, variable) => {
        // Get the value of the variable from the variables object
        const value = variables[variable.trim()];
        // If the variable is not found, return it unchanged
        return value !== undefined ? value : match;
    });
    return evaluatedExpression;
};
exports.substitueArgument = substitueArgument;
const evaluateExpression = (expression, variables) => {
    // Regular expression to match "${variable}" patterns
    const variableRegex = /{\$(.*?)}/g;
    // Replace each variable placeholder with its corresponding value
    const evaluatedExpression = expression.replace(variableRegex, (match, variable) => {
        // Get the value of the variable from the variables object
        const value = variables[variable.trim()];
        // If the variable is not found, return it unchanged
        return value !== undefined ? value : match;
    });
    if (evaluatedExpression !== expression) {
        // Use the Function constructor to safely evaluate the expression
        const safeEval = new Function(`return ${evaluatedExpression}`);
        // Call the constructed function to evaluate the expression
        return safeEval();
    }
    else
        return expression;
};
exports.evaluateExpression = evaluateExpression;
//# sourceMappingURL=evaluateExpression.js.map