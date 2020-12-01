import {
    assertArrayIncludes,
    assertEquals,
  } from "https://deno.land/std@0.79.0/testing/asserts.ts";

Deno.test("day 1", async () => {
  const text = await Deno.readTextFile('inputs/day1.txt');
  var numbers = text.split('\n').map(t => parseInt(t));

  function day1part1(numbers: Array<number>) {
    for (let i = 0; i < numbers.length; i++)
    {
      for (let j = i + 1; j < numbers.length; j++)
      {
        if (numbers[i] + numbers[j] == 2020)
        {
          return numbers[i] * numbers[j];
        }
      }
    }
    return NaN;
  }
  assertEquals(889779, day1part1(numbers));

  function day1part2(numbers: Array<number>) {
    for (let i = 0; i < numbers.length; i++)
    {
      for (let j = i + 1; j < numbers.length; j++)
      {
        for (let k = j + 1; k < numbers.length; k++)
        {
          if (numbers[i] + numbers[j] + numbers[k] == 2020)
          {
            return numbers[i] * numbers[j] * numbers[k];
          }
        }
      }
    }
    return NaN;
  }
  assertEquals(76110336, day1part2(numbers));
})