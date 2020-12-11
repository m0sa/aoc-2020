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
})