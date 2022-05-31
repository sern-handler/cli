package initialize

import (
	"errors"
	"os"
	"os/exec"

	"github.com/gookit/color"
	"github.com/sern-handler/cli/pkg/util"
)

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
