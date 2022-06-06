package extra

import (
	"os"

	"github.com/AlecAivazis/survey/v2"
	"github.com/gookit/color"
)

func Execute() {
	answers := struct {
		Extra string
	}{}

	err := survey.Ask(questions, &answers)

	if err != nil {
		color.Error.Prompt("Adding extras failed, exiting.")

		os.Exit(1)
	}

	switch answers.Extra {
	case "Dockerfile":
		err = addDockerfile()

		if err != nil {
			color.Error.Prompt("Adding the Dockerfile failed, exiting.")

			os.Exit(1)
		}
	}
}
