(function () {
    const { parser, traverse, generate, types } = require('../pak');

    const sourceCode = `
        console.log(1);

        function func() {
            console.info(2);
        }

        export default class Clazz {
            say() {
                console.debug(3);
            }
            render() {
                return <div>{console.error(4)}</div>
            }
        }
    `;

    const ast = parser.parse(sourceCode, {
        sourceType: 'unambiguous',
        plugins: ['jsx']
    });

    // traverse(ast, {
    //     CallExpression(path, state) {
    //         const isMemberExpression = types.isMemberExpression(path.node.callee);
    //         const isConsole = path.node.callee.object.name === 'console';
    //         const includeConsoleType = ['log', 'info', 'error', 'debug'].includes(path.node.callee.property.name);
            
    //         if (
    //             isMemberExpression && 
    //             isConsole && 
    //             includeConsoleType
    //         ) {
    //             const { line, column } = path.node.loc.start;
    //             path.node.arguments.unshift(types.stringLiteral(`filename: (${line}, ${column})`))
    //         }
    //     }
    // });

    const targetCalleeName = ['log', 'info', 'error', 'debug'].map(item => `console.${item}`);
    traverse(ast, {
        CallExpression (path, state) {
            // 使用 generate把 ast转为 code再做判断处理
            const calleeName = generate(path.node.callee).code;
            if (targetCalleeName.includes(calleeName)) {
                const { line, column } = path.node.loc.start;
                path.node.arguments.unshift(types.stringLiteral(`filename: (${line}, ${column})`))
            }
        }
    });

    const { code, map } = generate(ast);
    console.log(code);
} ())