package initialize

import (
	"os"

	"github.com/gookit/color"
)

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

func renamePackageJson(name string) error {
	color.Warn.Prompt("Work in progress...")

	return nil
}
