const makeDecArr = (n, acc = []) => {
    if (n === 0) return acc;
    acc.push(n);
    return makeDecArr(n - 1, acc);
}

const arr = makeDecArr(10);
console.log(arr);