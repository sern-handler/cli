package initialize

import "github.com/AlecAivazis/survey/v2"

var questions = []*survey.Question{
	{
		Name: "name",
		Prompt: &survey.Input{
			Message: "What is your project's name?",
		},
		Validate: survey.Required,
	},
	{
		Name: "language",
		Prompt: &survey.Select{
			Message: "What language do you want to use?",
			Options: []string{"JavaScript", "TypeScript"},
		},
	},
	{
		Name: "main",
		Prompt: &survey.Input{
			Message: "What is your project's main directory?",
			Default: "src",
		},
	},
	{
		Name: "commands",
		Prompt: &survey.Input{
			Message: "What is your project's command directory?",
			Default: "commands",
		},
	},
	{
		Name: "package",
		Prompt: &survey.Select{
			Message: "What package manager do you want to use?",
			Options: []string{"npm", "yarn", "skip"},
		},
	},
}
