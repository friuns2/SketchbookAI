let test = {
    a: 1,
    b: 2,
    d: [1, 2, 3],
    f: {
        g: 1,
        h: 2
    }
};
let recordChange = true;
let snapshot = {};
let changes = [];

function createProxy(obj, path = '') {
    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    return new Proxy(obj, {
        set(target, property, value) {
            if (!recordChange) return true;
            const fullPath = path ? `${path}.${property}` : property;
            if (!(fullPath in snapshot)) {
                snapshot[fullPath] = target[property];
            }
            changes.push({ property: fullPath, value });
            target[property] = value;
            return true;
        },
        get(target, property) {
            const value = target[property];
            if (typeof value === 'object' && value !== null) {
                const fullPath = path ? `${path}.${property}` : property;
                return createProxy(value, fullPath);
            }
            return value;
        }
    });
}

const testProxy = createProxy(test);

function undoChanges() {
    console.log("undoChanges", snapshot);
    for (const key in snapshot) {
        const parts = key.split('.');
        let obj = test;
        for (let i = 0; i < parts.length - 1; i++) {
            obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = snapshot[key];
    }
}

// Example usage:
console.log("Original:", JSON.stringify(testProxy));
testProxy.d.push(4);
console.log("After changes:", JSON.stringify(testProxy));
undoChanges();
console.log("After undo:", JSON.stringify(testProxy));

