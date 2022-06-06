package extra

import "github.com/AlecAivazis/survey/v2"

var questions = []*survey.Question{
	{
		Name: "extra",
		Prompt: &survey.Select{
			Message: "What extra do you want to add?",
			Options: []string{"Dockerfile"},
		},
	},
}
