// utility functions

// random number generator
export const random = (upTo: number): number =>
	Math.floor(Math.random() * upTo) + 1

// probability tester
export const should = (outOf: number): boolean => random(outOf) === 1

// capitalize the first letter
export const upCase = (str: string): string =>
	`${str[0].toUpperCase()}${str.slice(1)}`

// select random element
export const selectFrom = (arr: string[]): string =>
	arr[Math.floor(Math.random() * arr.length)]
