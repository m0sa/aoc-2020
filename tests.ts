import {
  assert,
  assertArrayIncludes,
  assertEquals,
} from "https://deno.land/std@0.79.0/testing/asserts.ts";

Deno.test("day 1", async () => {
  const text = await Deno.readTextFile("inputs/day1.txt");
  var numbers = text.split("\n").map((t) => parseInt(t));

  const day1 = (
    depth: number,
    numbers: Array<number>,
    index: number,
    values: Array<number>,
  ): { success: boolean; mul: number } => {
    if (values.length == depth) {
      return values.reduce((sum, next) => sum + next) == 2020
        ? { success: true, mul: values.reduce((mul, next) => mul * next) }
        : { success: false, mul: 0 };
    }

    while (index < numbers.length) {
      const number = numbers[index];
      const result = day1(depth, numbers, ++index, [number, ...values]);
      if (result.success) return result;
    }
    return { success: false, mul: -1 };
  };

  const day1part1 = (numbers: Array<number>) => day1(2, numbers, 0, []).mul;
  assertEquals(889779, day1part1(numbers));

  const day1part2 = (numbers: Array<number>) => day1(3, numbers, 0, []).mul;
  assertEquals(76110336, day1part2(numbers));
});

Deno.test("day 2", async () => {
  const input = (await Deno.readTextFile("inputs/day2.txt")).split("\n").map(
    (t) => {
      const match = /([0-9]+)-([0-9]+) ([a-z]): ([a-z]+)/.exec(t);
      return !match ? null : {
        min: parseInt(match[1]),
        max: parseInt(match[2]),
        char: match[3] + "",
        password: match[4] + "",
      };
    },
  );
  assertEquals(input[1]?.password, "frpknnndpntnncnnnnn");

  const specCheck1 = (
    min: number,
    max: number,
    char: string,
    password: string,
  ): boolean => {
    let count = 0;
    for (let i = 0; i < password.length; i++) {
      count += password[i] == char ? 1 : 0;
    }
    return count >= min && count <= max;
  };
  var part1 =
    input.filter((spec) =>
      spec == null
        ? false
        : specCheck1(spec.min, spec.max, spec.char, spec.password)
    ).length;
  assertEquals(part1, 445);

  const specCheck2 = (
    min: number,
    max: number,
    char: string,
    password: string,
  ): boolean => {
    var match1 = password[min - 1] == char;
    var match2 = password[max - 1] == char;
    return !match1 != !match2; // xor
  };
  var part2 =
    input.filter((spec) =>
      spec == null
        ? false
        : specCheck2(spec.min, spec.max, spec.char, spec.password)
    ).length;
  assertEquals(part2, 491);
});

Deno.test("day 3", async () => {
  const countTrees = (map: string, right: number, down: number): number => {
    const lines = map.split("\n");
    let treesHit = 0;

    for (let y = down, x = right; y < lines.length; y += down, x += right) {
      const line = lines[y];
      const tile = line[x % line.length];
      treesHit += tile == "#" ? 1 : 0;
    }
    return treesHit;
  };
  assertEquals(
    7,
    countTrees(
      `..##.......
#...#...#..
.#....#..#.
..#.#...#.#
.#...##..#.
..#.##.....
.#.#.#....#
.#........#
#.##...#...
#...##....#
.#..#...#.#`,
      3,
      1,
    ),
  );

  const map = await Deno.readTextFile("inputs/day3.txt");
  const part1 = countTrees(map, 3, 1);
  assertEquals(151, part1);

  var part2 = [
    [1, 1],
    [3, 1],
    [5, 1],
    [7, 1],
    [1, 2],
  ].reduce(
    (prev, current) => prev * countTrees(map, current[0], current[1]),
    1,
  );
  assertEquals(7540141059, part2);
});

Deno.test("day 4", async () => {
  const properties = ["byr", "iyr", "eyr", "hgt", "hcl", "ecl", "pid"];
  const parse = function (input: string): any[] {
    let result: any[] = [];
    let current: any = {};
    input.split("\n").forEach((line) => {
      if (line == "") {
        result.push(current);
        current = {};
        return;
      }
      line.split(" ").forEach((part) => {
        var field = part.split(":");
        current[field[0]] = field[1];
      });
    });
    return result;
  };
  const isValid1 = (passport: any) =>
    properties.filter((p) => passport[p]).length == properties.length;
  const passports = parse(await Deno.readTextFile("inputs/day4.txt"));

  assertEquals(256, passports.filter(isValid1).length);

  const isValid2 = (passport: any) => {
    const byr = parseInt(passport.byr);
    const iyr = parseInt(passport.iyr);
    const eyr = parseInt(passport.eyr);
    const hgt = parseInt(passport.hgt);
    const hgtStr = passport.hgt || "";
    const hgtU = hgtStr.length > 2 ? hgtStr.substring(hgtStr.length - 2) : "";

    return true &&
      byr >= 1920 && byr <= 2002 && byr + "" == passport.byr &&
      iyr >= 2010 && iyr <= 2020 && iyr + "" == passport.iyr &&
      eyr >= 2020 && eyr <= 2030 && eyr + "" == passport.eyr &&
      (
        (hgtU == "in" && hgt >= 59 && hgt <= 76) ||
        (hgtU == "cm" && hgt >= 150 && hgt <= 193)
      ) && hgt + "" + hgtU == passport.hgt &&
      /^#[a-f0-9]{6}$/.test(passport.hcl) &&
      /^amb|blu|brn|gry|grn|hzl|oth$/.test(passport.ecl) &&
      /^[0-9]{9}$/.test(passport.pid);
  };
  assertEquals(198, passports.filter(isValid2).length);
});

Deno.test("day 5", async () => {
  const decodeSeat = function (code: string): { row: number; col: number, id: number } {
    let row = { min: 0, max: 127 };
    let col = { min: 0, max: 7 };

    for (let i = 0; i < code.length; i++) {
      let term = i < 7 ? row : col;

      const next = term.max - (term.max - term.min) / 2;
      switch (code[i]) {
        case "F":
        case "L":
          term = { min: term.min, max: Math.floor(next) };
          break;
        case "B":
        case "R":
          term = { min: Math.ceil(next), max: term.max };
          break;
      }

      if (i < 7) {
        row = term;
      } else {
        col = term;
      }
    }

    return { row: row.max, col: col.max, id: row.max * 8 + col.max };
  };
  assertEquals({ row: 44, col: 5, id: 357 }, decodeSeat("FBFBBFFRLR"));
  assertEquals({ row: 70, col: 7, id: 567 }, decodeSeat("BFFFBBFRRR"));
  assertEquals({ row: 14, col: 7, id: 119 }, decodeSeat("FFFBBBFRRR"));
  assertEquals({ row: 102, col: 4, id: 820 }, decodeSeat("BBFFBBFRLL"));

  const allSeats = (await Deno.readTextFile('inputs/day5.txt')).split('\n').map(decodeSeat);

  const allSeastsDescId = allSeats.sort((a, b) => b.id - a.id);
  assertEquals(935, allSeastsDescId[0].id);

  let part2 = -1;
  for (let id = allSeastsDescId[0].id, i = 1; i < allSeastsDescId.length; id = allSeastsDescId[i].id, i++) {
    if (id - allSeastsDescId[i].id != 1)
    {
      part2 = id - 1;
      break;
    }
  }

  assertEquals(743, part2);
});
