// deno-lint-ignore-file no-explicit-any
import {
    assertEquals, fail,
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
    //assertEquals(part2(input), 2159626);
});

Deno.test('day 16', async () => {
    const parseInput = (input: string) : { tickets: number[][], fields: { name: string, ranges: number[][] }[] } => {
        let section = 0;
        let sectionLine = 0;
        const tickets: number[][] = [];
        const fields: { name: string, ranges: number[][] }[] = [];
        for (const line of input.split('\n')) {
            if (line == '') {
                section++;
                sectionLine = 0;
                continue;
            }
            switch (section) {
                case 0: {
                    const match = line.match(/(?<name>[a-z ]+): (?<from1>\d+)-(?<to1>\d+) or (?<from2>\d+)-(?<to2>\d+)/);
                    fields.push({
                        name: match?.groups?.name || 'parsing error',
                        ranges: [ [
                            Number(match?.groups?.from1),
                            Number(match?.groups?.to1)
                        ], [
                            Number(match?.groups?.from2),
                            Number(match?.groups?.to2)
                        ] ]
                    });
                    break;
                }
                case 1:
                case 2:
                    if (sectionLine > 0)
                        tickets.push(line.split(',').map(x => parseInt(x)));
                    break;
            }
            sectionLine++;
        }
        return { tickets, fields };
    }

    const input = await Deno.readTextFile('inputs/day16.txt');
    const example1 =
`class: 1-3 or 5-7
row: 6-11 or 33-44
seat: 13-40 or 45-50

your ticket:
7,1,14

nearby tickets:
7,3,47
40,4,50
55,2,20
38,6,12`;

    assertEquals(parseInput(example1).tickets.length, 5);
    assertEquals(parseInput(example1).fields.length, 3);

    const isFieldValidForRange = (number: number, range: number[]) =>
        number >= range[0] && number <= range[1];

    const isNumberValidForField = (number: number, field: { name: string, ranges: number[][] }) =>
        isFieldValidForRange(number, field.ranges[0]) || isFieldValidForRange(number, field.ranges[1]);

    const outOfAnyRangeNumbers = (ticket: number[], fields: { name: string, ranges: number[][] }[]) : number[] =>
        ticket.filter(number => fields.filter(isNumberValidForField.bind(null, number)).length == 0);

    const part1 = (input: string) : number => {
        const scan = parseInput(input);
        return scan.tickets
            .slice(1) // skip my ticket
            .reduce(
                (agg, ticket) => agg + outOfAnyRangeNumbers(ticket, scan.fields).reduce((a,i) => a+i, 0),
                0);
    }

    assertEquals(part1(example1), 71);
    assertEquals(part1(input), 26980);

    function* permute<T>(source: T[], isFeasible: (permutation:T[]) => number | null) {
        function* p(valueSoFar: T[], options: T[]) : Generator<T[], void, unknown> {
            if (options.length == 0)  {
                yield valueSoFar;
            } else {
                let isPrefixValid = true;
                if (valueSoFar.length > 0) {
                    // check if the prefix is feasible
                    const failsAt = isFeasible([...valueSoFar, ...options]);
                    isPrefixValid = failsAt === null || failsAt >= valueSoFar.length;
                    // console.log('prefix', valueSoFar.join(), isPrefixValid ? 'valid' : 'invalid at', failsAt);
                }
                if (isPrefixValid) {
                    // console.log('valid prefix', valueSoFar.join())
                    for (let i = 0; i < options.length; i++) {
                        yield* p([...valueSoFar, options[i]], [...options.slice(0, i), ...options.slice(i+1)])
                    }
                } else {
                    // console.log('pruning', valueSoFar.join());
                }
            }
        }
        yield* p([], source);
    }
    const part2 = (input: string) : number => {
        const scan = parseInput(input);
        const validTickets = scan.tickets.filter(ticket => outOfAnyRangeNumbers(ticket, scan.fields).length == 0);
        const myTicket = validTickets[0];
        const validatePermuzation = (fieldPermutation: number[]) : number | null => {
            for (let pfi = 0; pfi < fieldPermutation.length; pfi++) {
                const f = fieldPermutation[pfi];
                const field = scan.fields[f];
                const invalidOnTicketIndex = validTickets.findIndex(ti => !isNumberValidForField(ti[pfi], field));
                if (invalidOnTicketIndex >= 0) {
                    return pfi; // invalid permutation field index
                }
            }
            return null;
        }

        for (const fieldPermutation of permute([...scan.fields.keys()], validatePermuzation)) {
            const val = validatePermuzation(fieldPermutation)
            if (val === null)
            {
                return fieldPermutation.reduce((agg, f) => agg *=
                    scan.fields[f].name.startsWith('departure')
                     ? myTicket[f]
                     : 1,
                     1)
            }
        }
        return -1;
    }

    assertEquals(part2(
`departure gate: 0-1 or 4-19
row: 0-5 or 8-19
seat: 0-13 or 16-19

your ticket:
11,12,13

nearby tickets:
3,9,18
15,1,5
5,14,9`), 11);
    // TODO still takes ages, try different approach (find possible valid positions for each field), use that for pruning
    // assertEquals(part2(input), -2);
})
