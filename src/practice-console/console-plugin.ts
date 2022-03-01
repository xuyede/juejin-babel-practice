
module.exports = function (api) {
    const { types, template } = api;
    const targetCalleeName = ['log', 'info', 'error', 'debug'].map(item => `console.${item}`);
    
    return {
        visitor: {
            CallExpression (path, state) {
                if (path.node.isNew) {
                    return;
                }
    
                const calleeName = path.get('callee').toString();
                if (targetCalleeName.includes(calleeName)) {
                    const { line, column } = path.node.loc.start;
                    const newNode = template.expression(`
                        console.log("${state.filename || 'unkown filename'}:(${line}, ${column})")
                    `)();
                    newNode.isNew = true;
                    if (path.findParent(path => path.isJSXElement())) {
                        path.replaceWith(types.arrayExpression([newNode, path.node]))
                        path.skip()
                    } else {
                        path.insertBefore(newNode)
                    }
                }
            }
        }
    }
}