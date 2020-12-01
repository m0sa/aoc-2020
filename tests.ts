import {
    assertArrayIncludes,
    assertEquals,
  } from "https://deno.land/std@0.79.0/testing/asserts.ts";

Deno.test("day 1", async () => {
  const text = await Deno.readTextFile('inputs/day1.txt');
  var numbers = text.split('\n').map(t => parseInt(t));

  const day1 = (depth: number, numbers: Array<number>, index: number, values: Array<number>) : { success: boolean; mul: number } => {
    if (values.length == depth)
      return values.reduce((sum, next) => sum + next) == 2020
        ? { success: true, mul: values.reduce((mul, next) => mul * next) }
        : { success: false, mul: 0 };

    while (index < numbers.length) {
      const number = numbers[index];
      const result = day1(depth, numbers, ++index, [number, ...values]);
      if (result.success) return result;      
    }
    return { success: false, mul: -1 };
  }

  const day1part1 = (numbers: Array<number>) => day1(2, numbers, 0, []).mul;
  assertEquals(889779, day1part1(numbers));

  const day1part2 = (numbers: Array<number>) => day1(3, numbers, 0, []).mul
  assertEquals(76110336, day1part2(numbers));
})