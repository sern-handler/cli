package initialize

import (
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/go-git/go-git/v5"
	"github.com/sern-handler/cli/pkg/util"
)

func cloneRepository(name string, language string) {
	if _, err := os.Stat(name); os.IsExist(err) {
		fmt.Println(name + " already exists, can't initialize a new project.")

		return
	}

	_, err := git.PlainClone("templates", false, &git.CloneOptions{
		URL:      "https://github.com/sern-handler/templates",
		Progress: os.Stdout,
	})

	if err != nil {
		fmt.Println("Couldn't install the template, exiting.")

		return
	}

	err = os.Rename("templates/templates/"+strings.ToLower(language), name)

	if err != nil {
		fmt.Println("Couldn't install the template, exiting.")
	}

	err = os.RemoveAll("templates")

	if err != nil {
		return
	}
}

func renameFolders(name string, main string, commands string) {
	if main != "src" {
		err := os.Rename(name+"/src", name+"/"+main)

		if err != nil {
			fmt.Println("Couldn't rename the main folder, exiting.")

			return
		}
	}

	if commands != "commands" {
		err := os.Rename(name+"/"+main+"/commands", name+"/"+main+"/"+commands)

		if err != nil {
			fmt.Println("Couldn't rename the commands folder, exiting.")

			return
		}
	}
}

func installDependencies(name string, packageManager string) {
	err := os.Chdir(name)

	if err != nil {
		fmt.Println("Couldn't change to the project's directory, exiting.")

		return
	}

	packageManagers := util.CheckPackageManagers()

	if packageManager == "npm" && packageManagers.NPM {
		err := exec.Command("npm", "install").Run()

		if err != nil {
			fmt.Println("Couldn't install the dependencies, exiting.")

			return
		}

		fmt.Println("Successfully installed the dependencies.")
	}

	if packageManager == "yarn" && packageManagers.Yarn {
		err := exec.Command("yarn", "install").Run()

		if err != nil {
			fmt.Println("Couldn't install the dependencies, exiting.")

			return
		}

		fmt.Println("Successfully installed the dependencies.")
	}

	if packageManager == "skip" {
		fmt.Println("Skipping the installation of the dependencies.")
	}

	err = os.Chdir("..")

	if err != nil {
		fmt.Println("Couldn't change to the project's directory, exiting.")

		return
	}
}
