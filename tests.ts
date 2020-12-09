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
