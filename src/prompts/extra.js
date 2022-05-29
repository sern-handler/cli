export const extraPrompt = {
	message: 'What extra feature do you want to add?',
	name: 'extra',
	type: 'select',
	choices: [
		{
			title: 'Dockerfile (TypeScript)',
			description: 'Dockerfile for TypeScript',
			value: 'Dockerfile-typescript',
			selected: true,
		},
		{
			title: 'Dockerfile (JavaScript)',
			description: 'Dockerfile for JavaScript',
			value: 'Dockerfile-javascript',
			disabled: true,
		},
	],
};
