package initialize

import (
	"os"
	"strings"

	"github.com/go-git/go-git/v5"
	"github.com/gookit/color"
)

func cloneRepository(name string, language string) error {
	_, err := git.PlainClone("templates", false, &git.CloneOptions{
		URL:      "https://github.com/sern-handler/templates",
		Progress: os.Stdout,
	})

	if err != nil {
		color.Error.Prompt("Couldn't install the template.")

		return err
	}

	err = os.Rename("templates/templates/"+strings.ToLower(language), name)

	if err != nil {
		color.Error.Prompt("Couldn't rename the template to the project's name.")
		color.Warn.Prompt("The project was generated, but it wasn't renamed.\n\nYou can still use the project, but you will have to rename it manually.")

		return err
	}

	err = os.RemoveAll("templates")

	if err != nil {
		color.Error.Prompt("Couldn't remove the templates folder.")

		return err
	}

	return nil
}
