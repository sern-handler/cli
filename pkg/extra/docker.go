package extra

import (
	"os"

	"github.com/gookit/color"
	"github.com/sern-handler/cli/pkg/util"
)

func addDockerfile() error {
	var dockerfile string

	_, err := os.Stat("tsconfig.json")

	if err != nil {
		dockerfile = "Dockerfile.js"
	} else {
		dockerfile = "Dockerfile.ts"
	}

	color.Info.Prompt("Adding Dockerfile...")

	err = util.CopyFile("templates/extra/"+dockerfile, "Dockerfile")

	if err != nil {
		color.Error.Prompt("Couldn't add the Dockerfile, exiting.")

		return err
	}

	color.Info.Prompt("Successfully added the Dockerfile.")

	return nil
}
