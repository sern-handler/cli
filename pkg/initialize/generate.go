package initialize

import (
	"errors"
	"os"
	"os/exec"
	"strings"

	"github.com/go-git/go-git/v5"
	"github.com/gookit/color"
	"github.com/sern-handler/cli/pkg/util"
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

func renameFolders(name string, main string, commands string) error {
	if main != "src" {
		err := os.Rename(name+"/src", name+"/"+main)

		if err != nil {
			color.Warn.Prompt("Couldn't rename the main folder.")

			return err
		}
	}

	if commands != "commands" {
		err := os.Rename(name+"/"+main+"/commands", name+"/"+main+"/"+commands)

		if err != nil {
			color.Warn.Prompt("Couldn't rename the commands folder.")

			return err
		}
	}

	return nil
}

func installDependencies(name string, packageManager string) error {
	err := os.Chdir(name)

	if err != nil {
		color.Error.Prompt("Couldn't change to the project's directory.")

		return err
	}

	packageManagers := util.CheckPackageManagers()

	if packageManager == "npm" && packageManagers.NPM {
		err := exec.Command("npm", "install").Run()

		if err != nil {
			color.Error.Prompt("Couldn't install the dependencies.")

			return err
		}

		color.Info.Prompt("Successfully installed the dependencies.")
	}

	if packageManager == "yarn" && packageManagers.Yarn {
		err := exec.Command("yarn", "install").Run()

		if err != nil {
			color.Error.Prompt("Couldn't install the dependencies.")

			return err
		}

		color.Info.Prompt("Successfully installed the dependencies.")
	}

	if packageManager == "skip" {
		color.Warn.Prompt("Skipping the installation of the dependencies.")
	}

	if !packageManagers.NPM && !packageManagers.Yarn {
		color.Error.Prompt("Couldn't find any package managers.")

		return errors.New("couldn't find any package managers")
	}

	err = os.Chdir("..")

	if err != nil {
		color.Error.Prompt("Couldn't change to the starting directory.")

		return err
	}

	return nil
}
