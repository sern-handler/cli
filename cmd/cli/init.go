package cli

import (
	"fmt"

	"github.com/sern-handler/cli/pkg/components"
	"github.com/spf13/cobra"
)

var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Initialize a new Sern project.",
	Long:  `Initialize a new Sern project, either with a JavaScript or a TypeScript template.`,
	Run: func(cmd *cobra.Command, args []string) {
		projectName := components.NewInput("What is your project's name?", "example-project")

		language := components.NewSelection("What language do you want to use?", []string{"JavaScript", "TypeScript"})

		fmt.Println(projectName + " " + language)
	},
}
