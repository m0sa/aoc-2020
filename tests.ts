// deno-lint-ignore-file no-explicit-any
import {
    assertEquals,
  } from 'https://deno.land/std@0.79.0/testing/asserts.ts';

Deno.test('day 15', () => {

    const solve = (input: number[], numTurns: number) : number => {
        const spoken = new Array<number>(numTurns);
        const memory = new Array<Array<number>>(numTurns);
        for (let i = 0; i < numTurns; i++) {
            if (i < input.length) {
                spoken[i] = input[i];
            }
            else {
                const number = spoken[i-1];
                const seen = memory[number];
                if (seen.length < 2) {
                    spoken[i] = 0;
                } else {
                    spoken[i] = seen[1] - seen[0];
                }
            }

            const existing = memory[spoken[i]];
            memory[spoken[i]] = existing === undefined
                ? [i]
                : [existing[existing.length - 1], i];
        }
        return spoken[numTurns - 1];
    }
    assertEquals(solve([0,3,6], 9), 4);

    const part1 = (input: number[]) => solve(input, 2020);
    const input = [1,0,15,2,10,13];

    assertEquals(part1([0,3,6]), 436);
    assertEquals(part1([1,3,2]), 1);
    assertEquals(part1([2,1,3]), 10);
    assertEquals(part1([1,2,3]), 27);
    assertEquals(part1([2,3,1]), 78);
    assertEquals(part1([3,2,1]), 438);
    assertEquals(part1([3,1,2]), 1836);
    assertEquals(part1(input), 211);

    const part2 = (input: number[]) : number => solve(input, 30000000);

    // assertEquals(part2([0,3,6]), 175594);
    // assertEquals(part2([1,3,2]), 2578);
    // assertEquals(part2([2,1,3]), 3544142);
    // assertEquals(part2([1,2,3]), 261214);
    // assertEquals(part2([2,3,1]), 6895259);
    // assertEquals(part2([3,2,1]), 18);
    // assertEquals(part2([3,1,2]), 362);
    assertEquals(part2(input), 2159626);
});
