// deno-lint-ignore-file no-explicit-any
import {
    assert,
    assertArrayIncludes,
    assertEquals,
  } from "https://deno.land/std@0.79.0/testing/asserts.ts";

// my spidey sense tells me we might need to re-use this...

const aoConsole = function(program: string) {
    const instructions = program
        .split('\n')
        .map(line => { 
            const splitLine = line.split(' ');
            return {
                "operator": splitLine[0],
                "arguments": splitLine.slice(1).map(arg => parseInt(arg)),
            }
        });

    let ac = 0;
    let ip = 0;
    const step = () => {
        const instruction = instructions[ip];
        switch (instruction.operator) {
            case "nop":
                ip ++;
                break;
            case "acc":
                ac += instruction.arguments[0];
                ip ++;
                break;
            case "jmp": 
                ip += instruction.arguments[0];
                break;
            default:
                throw `${instruction.operator} not implemented at ip ${ip}`;
        }
        if (ip == instructions.length) {
            return true;
        }
    }

    return {
        accumulator: () => ac,
        instruction: () => ip,
        terminated: () => ip == instructions.length,
        step: step,
    };
};

Deno.test('day 8', async () => {
    const execute = (program: string) : { infiniteLoop: boolean, accumulator: number } => {
        const seenInstructions = new Set<number>();

        const prog = aoConsole(program);
        seenInstructions.add(prog.instruction());
        while (true) {
            const lastAcc = prog.accumulator();

            if (prog.step()) {
                return { accumulator: prog.accumulator(), infiniteLoop: false }
            }
            if (seenInstructions.has(prog.instruction())) {
                return { accumulator: lastAcc, infiniteLoop: true };
            }
            seenInstructions.add(prog.instruction());
        }
    }
    const part1 = (input: string) : number => execute(input).accumulator;

    const example =
`nop +0
acc +1
jmp +4
acc +3
jmp -3
acc -99
acc +1
jmp -4
acc +6`;
    const input = await Deno.readTextFile('inputs/day8.txt');

    assertEquals(5, part1(example));
    assertEquals(1723, part1(input));

    const part2 = (input: string) : number => {
        const re = /jmp|nop/g;
        while (re.exec(input) !== null) {
            const nextTry =
                input.substring(0, re.lastIndex - 3) +
                (input.substr(re.lastIndex - 3, 3) == "jmp" ? "nop" : "jmp") +
                input.substr(re.lastIndex);
            const result = execute(nextTry);
            if (!result.infiniteLoop) return result.accumulator;
        }
        throw "no result";
    };
    assertEquals(8, part2(example));
    assertEquals(846, part2(input));
});

Deno.test('day 9', async () => {
    const ranges = function* (maxLength: number) {
        for (let i = 0; i < maxLength; i++) {
            for (let j = i; j < maxLength; j++) {
                if (i == j) continue;
                yield { start: i, end: j };
            }
        }
    } 

    const part1 = (preamble: number, sequence: number[]) : number => {
        const preambleRanges = Array.from(ranges(preamble));
        for (let i = preamble; i < sequence.length; i++) {
            const current = sequence[i];
            const currentPreamble = sequence.slice(i - preamble, i);
            const isValid = preambleRanges
                .filter(range => currentPreamble[range.start] + currentPreamble[range.end] == current)
                .length > 0;
            if (!isValid)
                return current;
        }
        throw "sequence is valid";
    }
    const example = [ 35, 20, 15, 25, 47, 40, 62, 55, 65, 95, 102, 117, 150, 182, 127, 219, 299, 277, 309, 576 ];
    assertEquals(127, part1(5, example));

    const input = (await Deno.readTextFile('inputs/day9.txt')).split('\n').map(line => parseInt(line));
    assertEquals(36845998, part1(25, input));

    const part2 = (preamble: number, sequence: number[]) : number => {
        const target = part1(preamble, sequence);
        const allRanges = Array.from(ranges(sequence.length));
        for (let r = 0; r < allRanges.length; r++) {
            const range = allRanges[r];
            const slice = sequence.slice(range.start, range.end);
            if (target == slice.reduce((agg, next) => agg + next, 0)) {
                return slice.sort((a, b) => a-b)[0] + slice.sort((a, b) => b-a)[0];
            }
        }
        throw "no solution found";
    }
    assertEquals(62, part2(5, example));
    assertEquals(4830226, part2(25, input));
})

Deno.test('day 10', async () => {
    const example1 = [16, 10, 15, 5, 1, 11, 7, 19, 6, 12, 4];
    const example2 = [28, 33, 18, 42, 31, 14, 46, 20, 48, 47, 24, 23, 49, 45, 19, 38, 39, 11, 1, 32, 25, 35, 8, 17, 7, 9, 4, 2, 34, 10, 3];
    const input = (await Deno.readTextFile('inputs/day10.txt')).split('\n').map(x => parseInt(x));

    const part1 = (input: number[]) : number => {
        const sorted = [0, ...input.sort((a, b) => a - b), Math.max(...input) + 3]
        const deltas = [0, 0, 0, 0];
        for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i];
            const next = sorted[i + 1];
            deltas[next-current] += 1;
        }
        return deltas[1] * deltas[3];
    };
    assertEquals(part1(example1), 7 * 5);
    assertEquals(part1(example2), 22 * 10);
    assertEquals(part1(input), 1755);

    const part2 = (input: number[]) : number => {
        const sorted = [0, ...input.sort((a, b) => a - b)];
        const pathsInto = [1, ...input.map(_ => 0)];
        for (let i = 1; i < sorted.length; i++) {
            for (let j = i - 1; j >= 0 && sorted[i] - sorted[j] < 4 ; j--) {
                pathsInto[i] += pathsInto[j];
            }
        }
        return pathsInto.pop() || 0;
    }
    assertEquals(part2(example1), 8);
    assertEquals(part2(example2), 19208);
    assertEquals(part2(input), 4049565169664);
});

Deno.test('day 11', async () => {
    const example =
`L.LL.LL.LL
LLLLLLL.LL
L.L.L..L..
LLLL.LL.LL
L.LL.LL.LL
L.LLLLL.LL
..L.L.....
LLLLLLLLLL
L.LLLLLL.L
L.LLLLL.LL`;
    const input = await Deno.readTextFile('inputs/day11.txt');
    const isInBounds = (map: string[], line: number, row: number) =>
        line >= 0 && line < map.length &&
        row >= 0 && row < map[0].length;
    const countOccupied = (seats: string[]) => seats.filter(s => s == '#').length;
    const round = (state: string, tolerance: number, adjecent: (map: string[], line: number, row: number) => string[]) : string => {
        const map = state.split('\n');
        const result = state.split('\n').map(l => l.split(''));
        for (let line = 0; line < map.length; line ++) {
            for (let row = 0; row < map[line].length; row++) {
                const adjecentOccupied = countOccupied(adjecent(map, line, row));
                result[line][row] =
                    map[line][row] == 'L' && adjecentOccupied == 0 ? '#' :
                    map[line][row] == '#' && adjecentOccupied >= tolerance ? 'L' :
                    map[line][row];
            }
        }
        return result.map(l => l.join('')).join('\n');
    }
    const stabilize = (map: string, round: (map: string) => string) => {
        while(true) {
            const newMap = round(map);
            if (newMap == map) return map;
            map = newMap;
        }
    };

    const directions = [
        [ 1, -1],
        [ 1,  0],
        [ 1,  1],
        [-1, -1],
        [-1,  0],
        [-1,  1],
        [ 0, -1],
        [ 0,  1],
    ];
    const adjecent1 = (map: string[], line: number, row: number) : string[] =>
        directions
        .map(pos => [ line + pos[0], row + pos[1] ])
        .filter(pos => isInBounds(map, pos[0], pos[1]))
        .map(pos => map[pos[0]][pos[1]]);
    const part1 = (map: string) : number => countOccupied([...stabilize(map, m => round(m, 4, adjecent1))]);
    assertEquals(part1(example), 37);
    assertEquals(part1(input), 2289);

    const adjecent2 = (map: string[], line: number, row: number) => {
        const result = [];
        for (const direction of directions) {
            let current = [line, row];
            while (true) {
                current = [ current[0] + direction[0], current[1] + direction[1] ];
                if (!isInBounds(map, current[0], current[1])) {
                    break;
                }
                const tile = map[current[0]][current[1]];
                if (tile != '.') {
                    result.push(tile);
                    break;
                }
            }
        }
        return result;
    }
    const part2 = (map: string) : number => countOccupied([...stabilize(map, m => round(m, 5, adjecent2))]);
    assertEquals(part2(example), 26);
    assertEquals(part2(input), 2059);
});

Deno.test('day 12', async () => {
    const example = 'F10\nN3\nF7\nR90\nF11';
    const input = await Deno.readTextFile('inputs/day12.txt');
    interface Vector2D { readonly x: number; readonly y: number; }
    const Manhattan = (v: Vector2D) => Math.abs(v.x) + Math.abs(v.y);

    const part1 = (input: string): number => {
        const result = input.split('\n').reduce((state, line) => {
            const parameter = parseInt(line.slice(1));
            switch (line[0]) {
                case 'N': return { x: state.x, y: state.y + parameter, b: state.b };
                case 'S': return { x: state.x, y: state.y - parameter, b: state.b };
                case 'W': return { x: state.x - parameter, y: state.y, b: state.b };
                case 'E': return { x: state.x + parameter, y: state.y, b: state.b };
                case 'L': return { x: state.x, y: state.y, b: state.b - parameter };
                case 'R': return { x: state.x, y: state.y, b: state.b + parameter };
                case 'F': switch ((state.b + 10 * 360) % 360) {
                    case 0:   return { x: state.x, y: state.y + parameter, b: state.b };
                    case 90:  return { x: state.x + parameter, y: state.y, b: state.b };
                    case 180: return { x: state.x, y: state.y - parameter, b: state.b };
                    case 270: return { x: state.x - parameter, y: state.y, b: state.b };
                    default: throw `unexpected bearing ${state.b}`;
                }
                default: throw `unexpected instruction ${line[0]}`;
            }
        }, { x: 0, y: 0, b: 90 });

        return Manhattan(result);
    };
    assertEquals(part1(example), 25);
    assertEquals(part1(input), 562);

    const part2 = (input: string): number => {
        const Add = (a: Vector2D, b: Vector2D) : Vector2D => { return { x: a.x + b.x, y: a.y +  b.y }; }
        const Mul = (a: Vector2D, b: number) : Vector2D => { return { x: a.x * b, y: a.y * b }; }
        const Vec = (x: number, y: number) : Vector2D => { return { x, y }; }
        const Clockwise = (v: Vector2D, deg: number) : Vector2D => {
            switch ((deg + 720) % 360) {
                case  90: return Vec( v.y, -v.x);
                case 270: return Vec(-v.y,  v.x);
                case 180: return Vec(-v.x, -v.y);
                default: throw `unexpected rotation: ${deg}`;
            }
        }
        const CounterClockwise = (v: Vector2D, deg: number) => Clockwise(v, -deg);
        const result = input.split('\n').reduce((state, line) => {
            const parameter = parseInt(line.slice(1));
            switch (line[0]) {
                case 'N': return { s: state.s, w: Add(state.w, Vec(0,  parameter)) };
                case 'S': return { s: state.s, w: Add(state.w, Vec(0, -parameter)) };
                case 'W': return { s: state.s, w: Add(state.w, Vec(-parameter, 0)) };
                case 'E': return { s: state.s, w: Add(state.w, Vec( parameter, 0)) };
                case 'R': return { s: state.s, w: Clockwise(state.w, parameter) };
                case 'L': return { s: state.s, w: CounterClockwise(state.w, parameter) };
                case 'F': return { s: Add(state.s, Mul(state.w, parameter)), w:state.w };
                default: throw `unexpected instruction ${line[0]}`;
            }
        }, { s: Vec(0, 0), w: Vec(10, 1) });
        return Manhattan(result.s);
    };
    assertEquals(part2(example), 286);
    assertEquals(part2(input), 101860);
});

Deno.test('day 13', async () => {
    const example = "939\n7,13,x,x,59,x,31,19";
    const input = await Deno.readTextFile('inputs/day13.txt');
    const part1 = (input: string) => {
        const lines = input.split('\n');
        const params = {
            earliestDeparture: parseInt(lines[0]),
            lineIds: lines[1].split(',').filter(l => l != 'x').map(x => parseInt(x)).sort((a, b) => a - b),
        };
        for (let dt = 0; ; dt++) {
            const time = params.earliestDeparture + dt;
            for (const lineId of params.lineIds) {
                if (time % lineId == 0) {
                    return lineId * dt;
                }
            }
        }
    }

    assertEquals(part1(example), 295);
    assertEquals(part1(input), 138);

    const modInverse = (a: bigint, m: bigint) : bigint => {
        // gcd
        const s = []
        for (let b = m; b; ) {
            [a, b] = [b, a % b]
            s.push({a, b})
        }

        // find the inverse mod
        let [x, y] = [1n, 0n];
        for (let i = s.length - 2; i >= 0; --i) {
            [x, y] = [y,  x - y * (s[i].a / s[i].b)];
        }
        return (y + 2n * m) % m;
    }
    const chineseRemainders = (cases: { modulo: bigint, remainder: bigint }[]): bigint => {
        const prod = cases.reduce((agg, next) => agg * next.modulo, 1n);
        return cases.reduce((agg, next) => {
            const n = prod / next.modulo;
            return (agg + (next.remainder * n * modInverse(n, next.modulo))) % prod;
        }, 0n);
    }
    const part2 = (input: string) => chineseRemainders(input.split('\n')[1].split(',')
            .map((value, index) => { return { index: BigInt(index), lineId: value == 'x' ? 0n : BigInt(value) } })
            .filter(x => x.lineId > 0n)
            .map(x => { return { modulo: x.lineId, remainder: ((x.lineId * 4n) - x.index) % x.lineId } }));

    assertEquals(part2('\n17,x,13,19'),            3417n);
    assertEquals(part2('\n67,7,59,61'),          754018n);
    assertEquals(part2('\n67,x,7,59,61'),        779210n);
    assertEquals(part2(example),                1068781n);
    assertEquals(part2('\n67,7,x,59,61'),       1261476n);
    assertEquals(part2('\n1789,37,47,1889'), 1202161486n);
    assertEquals(part2(input),          226845233210288n);
});

Deno.test('day 14', async () => {
    const maxLen = 36;
    const fromBinary = (value: string): bigint => value
        .split('')
        .reduceRight((agg, next) => ({ total: agg.total + BigInt(next) * 2n**agg.power, power: agg.power + 1n }), { total: 0n, power: 0n })
        .total;

    assertEquals(fromBinary('000000000000000000000000000000001011'), 11n);
    assertEquals(fromBinary('000000000000000000000000000001001001'), 73n);

    const toBinary = (value: bigint): string => {
        const result = new Array(maxLen);
        for (let i = 0; i < result.length; i++) {
            result[result.length - i - 1] = value % 2n;
            value = value / 2n;
        }
        return result.join('');
    }
    assertEquals(toBinary(11n), '000000000000000000000000000000001011');
    assertEquals(toBinary(73n), '000000000000000000000000000001001001');


    const processProgram = (input: string, setMemory: (mem: any, mask: string, address: bigint, valueDec: bigint) => void) : bigint => {
        let mask = new Array(maxLen).fill('X').join(''); // no mask to start with..
        const mem: any = {};
        for(const line of input.split('\n')) {
            if (line.indexOf('mask = ') == 0) {
                mask = line.slice('mask = '.length);
            } else if(line.indexOf('mem[') == 0) {
                const address = BigInt(line.slice('mem['.length, line.indexOf(']')));
                const valueDec = BigInt(line.slice(line.indexOf('=') + 1));
                setMemory(mem, mask, address, valueDec);
            } else {
                throw 'unknown command: ' + line;
            }
        }
        return Object.getOwnPropertyNames(mem).reduce((agg, n) => agg + BigInt(mem[n]) , 0n);
    }

    const part1 = (input: string): bigint => processProgram(
        input, (mem, mask, address, valueDec) =>
            mem[address.toString()] = fromBinary(toBinary(valueDec).split('').map((val, i) => mask[i] == 'X' ? val : mask[i]).join(''))); // apply mask

    const example1 =
`mask = XXXXXXXXXXXXXXXXXXXXXXXXXXXXX1XXXX0X
mem[8] = 11
mem[7] = 101
mem[8] = 0`;
    const input = await Deno.readTextFile('inputs/day14.txt');
    assertEquals(part1(example1), 165n);
    assertEquals(part1(input), 11926135976176n);

    const part2 = (input: string) : bigint => {
        const powerset = <T>(set: T[]) : T[][] => {
            const ps : T[][] = [[]];
            for (let i = 0; i < set.length; i++) {
                for (let [j, len] = [0, ps.length]; j < len; j++) {
                    ps.push([...ps[j], set[i]]);
                }
            }
            return ps;
        }

        function* getTargetAddresses(address: bigint, mask: string) {
            const maskedAddress = toBinary(address).split('').map((val, i) => mask[i] == '0' ? val : mask[i]);
            const floatingBitIndices = maskedAddress.map((val, i) => ({ val, i })).filter(x => x.val == 'X').map(x => x.i);
            for (const indexSet of powerset(floatingBitIndices)) {
                const unfloatedAddress = maskedAddress.slice();
                for (const fl of floatingBitIndices) {
                    unfloatedAddress[fl] = indexSet.indexOf(fl) != -1 ? '1' : '0';
                }
                yield fromBinary(unfloatedAddress.join('')).toString();
            }
        }

        return processProgram(input, (mem, mask, address, valueDec) => {
            for(const t of getTargetAddresses(address, mask)) {
                mem[t] = valueDec;
            }
        })
    }
    const example2 =
`mask = 000000000000000000000000000000X1001X
mem[42] = 100
mask = 00000000000000000000000000000000X0XX
mem[26] = 1`;

    assertEquals(part2(example2), 208n);
    assertEquals(part2(input), 4330547254348n);
});
