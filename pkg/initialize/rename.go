package initialize

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
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
	file, err := ioutil.ReadFile(name + "/package.json")

	if err != nil {
		color.Warn.Prompt("Couldn't read the package.json file.")

		return err
	}

	var packageJSON PackageJSON

	err = json.Unmarshal(file, &packageJSON)

	if err != nil {
		fmt.Println(err)

		color.Warn.Prompt("Couldn't unmarshal the package.json file.")

		return err
	}

	packageJSON.Name = name

	file, err = json.MarshalIndent(packageJSON, "", "	")

	if err != nil {
		color.Warn.Prompt("Couldn't marshal the package.json file.")

		return err
	}

	err = ioutil.WriteFile(name+"/package.json", file, 0644)

	if err != nil {
		color.Warn.Prompt("Couldn't write the package.json file.")

		return err
	}

	return nil
}
