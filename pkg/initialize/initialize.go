package initialize

import (
	"fmt"

	"github.com/AlecAivazis/survey/v2"
)

func Initialize() {
	answers := struct {
		Name     string
		Language string
		Main     string
		Commands string
		Prefix   string
		Git      bool
		Package  string
	}{}

	err := survey.Ask(questions, &answers)

	if err != nil {
		fmt.Println("Project initialization failed, exiting.")

		return
	}

	cloneRepository(answers.Name, answers.Language)
}
