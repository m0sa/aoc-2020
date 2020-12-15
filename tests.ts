// deno-lint-ignore-file no-explicit-any
import {
    assertEquals,
  } from 'https://deno.land/std@0.79.0/testing/asserts.ts';

Deno.test('day 15', () => {

    const part1 = (input: number[]) : number => {
        const spoken = [...input];
        for (let i = spoken.length; spoken.length < 2020; i++) {
            const numberAt = i-1;
            const number = spoken[numberAt];
            const seenAt = spoken.lastIndexOf(number, i-2);
            if (seenAt == -1) {
                spoken.push(0); // the first time the number was spoken
            } else {
                spoken.push(numberAt - seenAt);
            }

        }
        return spoken[2020 - 1];
    }

    assertEquals(part1([0,3,6]), 436);
    assertEquals(part1([1,3,2]), 1);
    assertEquals(part1([2,1,3]), 10);
    assertEquals(part1([1,2,3]), 27);
    assertEquals(part1([2,3,1]), 78);
    assertEquals(part1([3,2,1]), 438);
    assertEquals(part1([3,1,2]), 1836);
    assertEquals(part1([1,0,15,2,10,13]), 211); // part 1 input
});
