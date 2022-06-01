package initialize

import (
	"fmt"
	"os"

	"github.com/AlecAivazis/survey/v2"
	"github.com/gookit/color"
)

func Initialize() {
	answers := struct {
		Name     string
		Language string
		Main     string
		Commands string
		Package  string
	}{}

	err := survey.Ask(questions, &answers)

	if err != nil {
		fmt.Println("Project initialization failed, exiting.")

		os.Exit(1)
	}

	color.Info.Prompt("Initializing the project...")

	err = cloneRepository(answers.Name, answers.Language)

	if err != nil {
		color.Error.Prompt("Couldn't generate the project from the templates, exiting.")

		err = os.RemoveAll("templates")

		if err != nil {
			color.Error.Prompt("Couldn't remove the templates folder.")
		}

		os.Exit(1)
	}

	err = os.RemoveAll("templates")

	if err != nil {
		color.Error.Prompt("Couldn't remove the templates folder.")
	}

	color.Info.Prompt("Successfully generated the project from the templates.")

	color.Info.Prompt("Renaming the project's folders...")

	err = renameFolders(answers.Name, answers.Main, answers.Commands)

	if err != nil {
		color.Error.Prompt("Couldn't rename the folders, exiting.")
		color.Warn.Prompt("The project was generated, but the folders weren't renamed.\n\nYou can still use the project, but you will have to rename the folders manually.")

		os.Exit(1)
	}

	color.Info.Prompt("Successfully renamed the project's folders.")

	color.Info.Prompt("Installing the dependencies...")

	err = installDependencies(answers.Name, answers.Package)

	if err != nil {
		color.Error.Prompt("Couldn't install the dependencies, exiting.")
		color.Warn.Prompt("The project was generated, but the dependencies weren't installed.\n\nYou can still use the project, but you will have to install the dependencies manually.")

		os.Exit(1)
	}

	err = renamePackageJson(answers.Name)

	if err != nil {
		color.Error.Prompt("Couldn't rename the package.json file, exiting.")
		color.Warn.Prompt("The project was generated, but the package.json file wasn't updated.\n\nYou can still use the project, but you will have to update the package.json file manually.")

		os.Exit(1)
	}

	color.Success.Prompt("Project successfully initialized.")
}
