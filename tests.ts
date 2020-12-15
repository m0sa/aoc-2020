// deno-lint-ignore-file no-explicit-any
import {
    assert,
    assertEquals,
  } from 'https://deno.land/std@0.79.0/testing/asserts.ts';

// my spidey sense tells me we might need to re-use this...

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
